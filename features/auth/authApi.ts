import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toQueryError } from "@/lib/utils/apiError";
import { patchProfile } from "./authSlice";
import {
  mockGetSession,
  mockLogin,
  mockRegister,
  mockRequestPasswordReset,
  mockResendOtp,
  mockResetPassword,
  mockUpdateProfile,
  mockVerifyOtp,
} from "@/lib/mocks/auth.mock";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  RegisterPayload,
  RegisterResponse,
  ResendOtpPayload,
  ResetPasswordPayload,
  User,
  VerifyOtpPayload,
} from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Real-mode auth architecture (Backend Architecture doc §3):
 * "Supabase Auth as the identity provider, NestJS as the authorization
 * layer." Sign-up/login/OTP/password-reset go straight to Supabase Auth's
 * client SDK (lib/supabase/client.ts) — NOT a custom `/auth/login` NestJS
 * endpoint. Once Supabase hands back a session, we fetch the matching
 * `profiles` row via `GET /users/me` (NestJS, validates the Supabase JWT)
 * to get role/name/etc. — Supabase's own `user` object only knows about
 * identity fields, not our business-level profile.
 *
 * `fetchWithBQ` reads its bearer token from Redux (`state.auth.session`),
 * which doesn't exist yet mid-login — so `withFreshToken` below passes the
 * just-obtained Supabase access token explicitly via request headers,
 * which `baseApi`'s `prepareHeaders` will NOT override (it only sets the
 * header when a token already exists in the store).
 *
 * Ported from the `frontend` branch's `features/auth/authApi.ts`, with the
 * admin-only `getAllUsers`/`setUserActive` endpoints dropped — they exist
 * solely to support an admin panel that isn't part of this branch, and
 * pulling them in would also require porting `features/audit/*` for
 * `logAdminAction`. Add them back (see `frontend`) once an admin area exists.
 * ═══════════════════════════════════════════════════════════════════════
 */

/** The shape RTK Query actually hands a custom `queryFn` as its 4th (`fetchWithBQ`) argument — pre-bound, single-arg, unlike the full 3-arg `BaseQueryFn` type, and possibly-but-not-always a Promise (mirrors RTK's internal `MaybePromise`). */
type FetchWithBQResult = { data?: unknown; error?: FetchBaseQueryError; meta?: unknown };
type FetchWithBQ = (arg: string | FetchArgs) => FetchWithBQResult | PromiseLike<FetchWithBQResult>;

function toAuthSession(session: Session) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    // Supabase gives `expires_at` in seconds-since-epoch; the app's AuthSession uses ms.
    expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
  };
}

function fromSupabaseError(error: AuthError): FetchBaseQueryError {
  return { status: error.status ?? "CUSTOM_ERROR", data: { message: error.message } } as FetchBaseQueryError;
}

/** Fetches the NestJS-side profile using a token that may not be in Redux yet. */
async function fetchProfile(fetchWithBQ: FetchWithBQ, accessToken: string) {
  return fetchWithBQ({ url: "/users/me", headers: { Authorization: `Bearer ${accessToken}` } });
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockLogin(credentials) };

          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signInWithPassword(credentials);
          if (error) return { error: fromSupabaseError(error) };
          if (!data.session) {
            return { error: { status: "CUSTOM_ERROR", error: "Login succeeded but no session was returned." } };
          }

          const session = toAuthSession(data.session);
          const profileResult = await fetchProfile(fetchWithBQ, session.accessToken);
          if (profileResult.error) return { error: profileResult.error };
          return { data: { user: profileResult.data as User, session } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<RegisterResponse, RegisterPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRegister(payload) };

          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              data: { full_name: payload.name, phone: payload.phone, role: payload.role ?? "customer" },
            },
          });
          if (error) return { error: fromSupabaseError(error) };
          if (!data.user) {
            return { error: { status: "CUSTOM_ERROR", error: "Sign-up succeeded but no account was returned." } };
          }

          // No session yet if the Supabase project requires email
          // confirmation — the caller (register page) routes to /verify
          // either way; the `profiles` row gets created server-side by
          // NestJS's Supabase Auth webhook once the account is confirmed.
          if (!data.session) {
            return {
              data: {
                user: {
                  id: data.user.id,
                  email: data.user.email ?? payload.email,
                  name: payload.name,
                  phone: payload.phone,
                  role: payload.role ?? "customer",
                  avatarUrl: null,
                  emailVerified: false,
                  createdAt: data.user.created_at,
                  updatedAt: data.user.created_at,
                  active: true,
                },
                session: null,
                requiresVerification: true,
              },
            };
          }

          const session = toAuthSession(data.session);
          const profileResult = await fetchProfile(fetchWithBQ, session.accessToken);
          if (profileResult.error) return { error: profileResult.error };
          return { data: { user: profileResult.data as User, session, requiresVerification: false } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    verifyOtp: builder.mutation<AuthResponse, VerifyOtpPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockVerifyOtp(payload) };

          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.verifyOtp({
            email: payload.email,
            token: payload.code,
            type: "signup",
          });
          if (error) return { error: fromSupabaseError(error) };
          if (!data.session) {
            return { error: { status: "CUSTOM_ERROR", error: "Verification succeeded but no session was returned." } };
          }

          const session = toAuthSession(data.session);
          const profileResult = await fetchProfile(fetchWithBQ, session.accessToken);
          if (profileResult.error) return { error: profileResult.error };
          return { data: { user: profileResult.data as User, session } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    /** Validates a persisted access token and returns the current user. Used by AuthProvider on boot. */
    getSession: builder.query<AuthResponse, string>({
      queryFn: async (token, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetSession(token) };

          // The persisted token might be stale — let Supabase refresh it
          // rather than trusting it blindly against NestJS.
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            return { error: error ? fromSupabaseError(error) : { status: 401, data: { message: "Session expired." } } };
          }

          const session = toAuthSession(data.session);
          const profileResult = await fetchProfile(fetchWithBQ, session.accessToken);
          if (profileResult.error) return { error: profileResult.error };
          return { data: { user: profileResult.data as User, session } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Auth"],
    }),

    resendOtp: builder.mutation<MessageResponse, ResendOtpPayload>({
      queryFn: async (payload) => {
        try {
          if (isDevMode) return { data: await mockResendOtp(payload) };

          const supabase = getSupabaseClient();
          const { error } = await supabase.auth.resend({ type: "signup", email: payload.email });
          if (error) return { error: fromSupabaseError(error) };
          return { data: { message: "Verification code resent." } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    requestPasswordReset: builder.mutation<MessageResponse, ForgotPasswordPayload>({
      queryFn: async (payload) => {
        try {
          if (isDevMode) return { data: await mockRequestPasswordReset(payload) };

          const supabase = getSupabaseClient();
          const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
          const { error } = await supabase.auth.resetPasswordForEmail(payload.email, { redirectTo });
          if (error) return { error: fromSupabaseError(error) };
          return { data: { message: "Password reset link sent." } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    /**
     * Real mode ignores `payload.token` — by the time this fires, the user
     * already has an active Supabase "recovery" session from clicking the
     * emailed link (the client is configured with `detectSessionInUrl`,
     * see lib/supabase/client.ts), so `updateUser` applies directly to it.
     * The `token` field only has meaning in dev mode's simpler mock flow.
     */
    resetPassword: builder.mutation<AuthResponse, ResetPasswordPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockResetPassword(payload) };

          const supabase = getSupabaseClient();
          const { error } = await supabase.auth.updateUser({ password: payload.password });
          if (error) return { error: fromSupabaseError(error) };
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            return { error: { status: "CUSTOM_ERROR", error: "Password updated but no active session was found." } };
          }

          const session = toAuthSession(sessionData.session);
          const profileResult = await fetchProfile(fetchWithBQ, session.accessToken);
          if (profileResult.error) return { error: profileResult.error };
          return { data: { user: profileResult.data as User, session } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    /** Doc §5, UsersModule: `PATCH /users/me` — the account owner editing their own profile. */
    updateProfile: builder.mutation<User, { userId: string; patch: { name?: string; phone?: string; avatarUrl?: string | null } }>({
      queryFn: async ({ userId, patch }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateProfile(userId, patch) };
          const result = await fetchWithBQ({ url: "/users/me", method: "PATCH", body: patch });
          if (result.error) return { error: result.error };
          return { data: result.data as User };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(patchProfile(data));
        } catch {
          // mutation failed — nothing to patch
        }
      },
      invalidatesTags: ["Auth"],
    }),

    /** Device/session management (doc §3) — list active sessions for the signed-in user. */
    getMySessions: builder.query<{ id: string; userAgent: string; lastActiveAt: string; current: boolean }[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) {
            return {
              data: [
                { id: "current", userAgent: "This device", lastActiveAt: new Date().toISOString(), current: true },
              ],
            };
          }
          const result = await fetchWithBQ("/auth/sessions");
          if (result.error) return { error: result.error };
          return { data: result.data as { id: string; userAgent: string; lastActiveAt: string; current: boolean }[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Auth"],
    }),

    /** Revokes a session other than the current one (or the current one, ending it). */
    revokeSession: builder.mutation<MessageResponse, string>({
      queryFn: async (sessionId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: { message: "Session revoked." } };
          const result = await fetchWithBQ({ url: `/auth/sessions/${sessionId}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: { message: "Session revoked." } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useLazyGetSessionQuery,
  useResendOtpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useGetMySessionsQuery,
  useRevokeSessionMutation,
} = authApi;
