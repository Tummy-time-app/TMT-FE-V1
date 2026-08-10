export type UserRole =
  | "customer"
  | "vendor"
  | "rider"
  | "admin"
  | "super_admin"
  | "support";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
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
