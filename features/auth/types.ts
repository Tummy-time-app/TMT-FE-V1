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
 * there's no avatarUrl, emailVerified, active, vendorId, or timestamp
 * fields anywhere in user-service's auth responses.
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
 * Both /register and /login return a full session immediately — there's
 * no email-confirmation gate (no verification flow exists on this backend
 * at all, see authApi.ts's doc comment), so register and login share this
 * one response shape.
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
