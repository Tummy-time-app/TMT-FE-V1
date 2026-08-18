import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetSession, mockLogin, mockRegister } from "@/lib/mocks/auth.mock";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User,
} from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * TMT-BE-V1's user-service (see services/user-service/src/routes/auth.ts —
 * the wired-up router; routes/auth.route.ts is a dead, unmounted stub with
 * empty login/verify/forgot-password handlers, don't trust it) is a plain
 * Express + jsonwebtoken auth: no Supabase, no NestJS, no /api/v1 prefix,
 * no email verification/OTP/password-reset, and *no route is actually
 * protected* — shared/src/middleware/auth.ts's authenticateJWT exists but
 * isn't applied anywhere server-side yet.
 *
 * Access tokens live 15 minutes, refresh tokens 7 days (both JWTs signed
 * with the same payload: {id, email, name, role}) — see user-service's
 * generateTokens(). GET /users/me only decodes whichever access token you
 * send it; it does NOT hit the DB, so the `phone` field (never in the JWT
 * payload) disappears after a session restore even though it was present
 * right after login/register. That's a backend gap, not a bug here.
 * ═══════════════════════════════════════════════════════════════════════
 */

/** Mirrors user-service's generateTokens() access-token lifetime. */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/** The exact envelope POST /users/register and POST /users/login return. */
interface BackendAuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  /** Same value as accessToken — the backend sends it twice for convenience. */
  token: string;
  user: User;
}

function toAuthResponse(body: BackendAuthResponse): AuthResponse {
  return {
    user: body.user,
    session: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
    },
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockLogin(credentials) };

          const result = await fetchWithBQ({
            url: "/api/users/login",
            method: "POST",
            body: credentials,
          });
          if (result.error) return { error: result.error };
          return { data: toAuthResponse(result.data as BackendAuthResponse) };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRegister(payload) };

          const result = await fetchWithBQ({
            url: "/api/users/register",
            method: "POST",
            body: payload,
          });
          if (result.error) return { error: result.error };
          return { data: toAuthResponse(result.data as BackendAuthResponse) };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    /**
     * Validates a persisted access token and returns the current user.
     * Used by AuthProvider on boot. Since GET /users/me can't refresh a
     * dead token itself, a 401 here is followed by one POST /users/refresh
     * attempt (when a refresh token is available) before giving up.
     */
    getSession: builder.query<AuthResponse, { accessToken: string; refreshToken?: string }>({
      queryFn: async ({ accessToken, refreshToken }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetSession(accessToken) };

          const me = await fetchWithBQ({
            url: "/api/users/me",
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!me.error) {
            const { user } = me.data as { user: User };
            return {
              data: {
                user,
                session: { accessToken, refreshToken: refreshToken ?? "", expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS },
              },
            };
          }

          if (!refreshToken) return { error: me.error };

          const refreshed = await fetchWithBQ({
            url: "/api/users/refresh",
            method: "POST",
            body: { refreshToken },
          });
          if (refreshed.error) return { error: refreshed.error };
          const refreshedTokens = refreshed.data as { accessToken: string; refreshToken: string };

          const retryMe = await fetchWithBQ({
            url: "/api/users/me",
            headers: { Authorization: `Bearer ${refreshedTokens.accessToken}` },
          });
          if (retryMe.error) return { error: retryMe.error };
          const { user } = retryMe.data as { user: User };

          return {
            data: {
              user,
              session: {
                accessToken: refreshedTokens.accessToken,
                refreshToken: refreshedTokens.refreshToken,
                expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
              },
            },
          };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useLazyGetSessionQuery } = authApi;
