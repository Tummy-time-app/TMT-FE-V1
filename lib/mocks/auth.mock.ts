import { mockDelay } from "@/lib/dev/devMode";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  User,
  VerifyOtpPayload,
} from "@/features/auth/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Only lib/dev/devMode.ts-gated branches inside features/*Api.ts import
 * from here. Backed by localStorage so login/register/OTP feel real across
 * a session without a backend. Swap to the real backend by wiring the
 * `query` branch in the relevant api slice and deleting the mock import —
 * see features/auth/authApi.ts.
 * ═══════════════════════════════════════════════════════════════════════
 */

interface MockUserRecord extends User {
  password: string;
}

const USERS_STORAGE_KEY = "tummytime_mock_users";
/** The OTP every mock verification accepts — printed to the console so it's discoverable. */
const MOCK_OTP = "123456";

function seedUsers(): MockUserRecord[] {
  return [
    {
      id: "dev-customer-1",
      email: "demo@tummytime.dev",
      name: "Demo Customer",
      role: "customer",
      avatarUrl: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      password: "password123",
    },
  ];
}

function loadUsers(): MockUserRecord[] {
  if (typeof window === "undefined") return seedUsers();
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const seeded = seedUsers();
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as MockUserRecord[];
  } catch {
    return seedUsers();
  }
}

function saveUsers(users: MockUserRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function issueSession(userId: string) {
  return {
    accessToken: `mock.${userId}.${Date.now()}`,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12, // 12h
  };
}

function toPublicUser(record: MockUserRecord): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    phone: record.phone,
    role: record.role,
    avatarUrl: record.avatarUrl,
    emailVerified: record.emailVerified,
    createdAt: record.createdAt,
  };
}

export async function mockLogin({ email, password }: LoginCredentials): Promise<AuthResponse> {
  await mockDelay();
  const users = loadUsers();
  const record = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!record || record.password !== password) {
    throw { status: 401, message: "Invalid email or password." };
  }
  return { user: toPublicUser(record), session: issueSession(record.id) };
}

export async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await mockDelay();
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
    throw { status: 422, message: "An account with this email already exists." };
  }
  const record: MockUserRecord = {
    id: `dev-${payload.role ?? "customer"}-${Date.now()}`,
    email: payload.email.trim(),
    name: payload.name,
    phone: payload.phone,
    role: payload.role ?? "customer",
    avatarUrl: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    password: payload.password,
  };
  saveUsers([...users, record]);
  if (typeof window !== "undefined") {
    console.info(`[dev mock] Verification code for ${record.email}: ${MOCK_OTP}`);
  }
  return { user: toPublicUser(record), session: issueSession(record.id) };
}

export async function mockVerifyOtp({ email, code }: VerifyOtpPayload): Promise<AuthResponse> {
  await mockDelay(600);
  if (code !== MOCK_OTP) {
    throw { status: 422, message: "Invalid verification code.", errors: { code: ["Invalid verification code."] } };
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (idx === -1) {
    throw { status: 404, message: "No account found for this email." };
  }
  users[idx] = { ...users[idx], emailVerified: true };
  saveUsers(users);
  return { user: toPublicUser(users[idx]), session: issueSession(users[idx].id) };
}

export async function mockGetSession(token: string): Promise<AuthResponse> {
  await mockDelay(250);
  const userId = token.split(".")[1];
  const users = loadUsers();
  const record = users.find((u) => u.id === userId);
  if (!record) {
    throw { status: 401, message: "Session expired." };
  }
  return { user: toPublicUser(record), session: issueSession(record.id) };
}

export async function mockResendOtp({ email }: ResendOtpPayload): Promise<MessageResponse> {
  await mockDelay(400);
  const users = loadUsers();
  if (!users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw { status: 404, message: "No account found for this email." };
  }
  if (typeof window !== "undefined") {
    console.info(`[dev mock] Verification code for ${email}: ${MOCK_OTP}`);
  }
  return { message: "Verification code resent." };
}

const RESET_TOKENS_STORAGE_KEY = "tummytime_mock_reset_tokens";

function loadResetTokens(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RESET_TOKENS_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveResetTokens(tokens: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export async function mockRequestPasswordReset({ email }: ForgotPasswordPayload): Promise<MessageResponse> {
  await mockDelay(500);
  const users = loadUsers();
  const record = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  // Always report success even if the account doesn't exist, so the UI
  // can't be used to enumerate registered emails.
  if (record) {
    const token = `reset.${record.id}.${Date.now()}`;
    const tokens = loadResetTokens();
    tokens[token] = record.id;
    saveResetTokens(tokens);
    if (typeof window !== "undefined") {
      console.info(
        `[dev mock] Password reset link for ${email}: /reset-password?token=${token}`
      );
    }
  }
  return { message: "If an account exists for that email, a reset link has been sent." };
}

export async function mockResetPassword({ token, password }: ResetPasswordPayload): Promise<AuthResponse> {
  await mockDelay(500);
  const tokens = loadResetTokens();
  const userId = tokens[token];
  if (!userId) {
    throw { status: 422, message: "This reset link is invalid or has expired." };
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    throw { status: 404, message: "No account found for this reset link." };
  }
  users[idx] = { ...users[idx], password };
  saveUsers(users);
  delete tokens[token];
  saveResetTokens(tokens);
  return { user: toPublicUser(users[idx]), session: issueSession(users[idx].id) };
}
