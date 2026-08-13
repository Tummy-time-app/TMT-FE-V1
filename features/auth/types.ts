export type UserRole =
  | "customer"
  | "vendor"
  | "rider"
  | "admin"
  | "super_admin"
  | "support";

/**
 * Mirrors the backend's `profiles` table (1:1 with Supabase `auth.users`,
 * see Backend Architecture doc §4 "Core identity"). Field names stay
 * camelCase — idiomatic for a NestJS DTO layer / this codebase's existing
 * convention — rather than the DB's literal snake_case columns; each
 * doc-comment below notes the backend column it maps to where it isn't a
 * mechanical camelCase of the same name.
 */
export interface User {
  id: string;
  email: string;
  /** Maps to `profiles.full_name`. */
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string | null;
  /** Maps to `profiles.is_verified`. */
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  /** Only set for role "vendor" — which vendor record (features/vendors) this account manages. */
  vendorId?: string;
  /** Only set for role "rider". */
  vehicleType?: "bike" | "bicycle" | "car";
  /** Deactivated accounts (admin action) can't log in. Maps to `profiles.is_active`. */
  active: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms */
  expiresAt: number;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
}

/**
 * Real-backend `register` can't always return an active session inline —
 * if the Supabase project requires email confirmation, `signUp()` returns
 * no session until the OTP is verified (see `authApi.ts`). Dev mode always
 * returns a real session (mocks don't model email confirmation), but the
 * type stays honest about the real-world possibility.
 */
export interface RegisterResponse {
  user: User;
  session: AuthSession | null;
  /** True when the account exists but still needs OTP verification before it can be used. */
  requiresVerification: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Extract<UserRole, "customer" | "vendor" | "rider">;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
