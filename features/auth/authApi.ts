import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetSession, mockLogin, mockRegister, mockVerifyOtp } from "@/lib/mocks/auth.mock";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  VerifyOtpPayload,
} from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockLogin(credentials) };
          const result = await fetchWithBQ({ url: "/auth/login", method: "POST", body: credentials });
          if (result.error) return { error: result.error };
          return { data: result.data as AuthResponse };
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
          const result = await fetchWithBQ({ url: "/auth/register", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as AuthResponse };
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
          const result = await fetchWithBQ({ url: "/auth/verify-otp", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as AuthResponse };
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
          const result = await fetchWithBQ("/auth/session");
          if (result.error) return { error: result.error };
          return { data: result.data as AuthResponse };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useLazyGetSessionQuery,
} = authApi;
