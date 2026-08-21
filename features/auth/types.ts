/**
 * Mirrors TMT-BE-V1's user-service exactly — see services/user-service/src/
 * db/schema.ts (the `user_role` pgEnum) and routes/auth.ts (the wired-up
 * router; routes/auth.route.ts is a dead, unmounted stub — don't trust it).
 *
 * This is NOT the richer role/profile model the `frontend` branch's ported
 * code assumed (that one talked to Supabase Auth + a NestJS profiles table).
 * There is no "rider" role, no "super_admin", no "support" — vendor staff
 * roles cover restaurant-side accounts instead.
 */
export type UserRole =
  | "customer"
  | "restaurant_owner"
  | "admin"
  | "vendor_owner"
  | "vendor_manager"
  | "vendor_kitchen"
  | "vendor_accountant";

/**
 * The user object the backend actually sends back. Deliberately thin —
 * there's no avatarUrl, active, vendorId, or timestamp field anywhere in
 * user-service's auth responses.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /**
   * Present right after login/register (returned straight from the DB row).
   * Absent after a session restore via GET /users/me — that endpoint only
   * decodes the JWT payload (id/email/name/role), which never carried
   * phone. A real gap in the backend, not a frontend bug — surfaced here
   * via the optional type rather than silently defaulting to "".
   */
  phone?: string;
  /**
   * Absent after a session restore via GET /users/me for the same reason
   * `phone` is — the JWT payload never carried it either. Only meaningful
   * right after register/login.
   */
  isEmailVerified?: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /**
   * Epoch ms. The backend doesn't return an explicit expiry — it just
   * issues a JWT with a fixed lifetime (see authApi.ts's
   * ACCESS_TOKEN_TTL_MS, mirroring user-service's generateTokens()) — so
   * this is computed client-side at the moment the token is issued.
   */
  expiresAt: number;
}

/**
 * A full session — what a *verified* login always returns, and what
 * register used to return immediately before TMT-BE-V1 grew an
 * email-verification gate (see authApi.ts's doc comment). Register no
 * longer returns this; see RegisterResult below.
 */
export interface AuthResponse {
  user: User;
  session: AuthSession;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Defaults to "customer" server-side if omitted. */
  role?: Extract<UserRole, "customer" | "restaurant_owner">;
}

/**
 * Every successful registration returns this now — new accounts always
 * start unverified, so no session/tokens come back at all. The user must
 * click the link user-service emailed them (GET /users/verify-email, handled
 * entirely server-side — no frontend route calls it) before they can log in.
 */
export interface RegisterResult {
  message: string;
  requiresVerification: true;
  user: User;
}

/**
 * The error body POST /users/login sends back (as a 403) when the account
 * exists, the password is correct, but isEmailVerified is still false.
 * Lets LoginForm distinguish "wrong password" from "go check your email"
 * and offer a resend instead of a generic error message.
 */
export interface UnverifiedLoginError {
  error: string;
  requiresVerification: true;
  email: string;
}
