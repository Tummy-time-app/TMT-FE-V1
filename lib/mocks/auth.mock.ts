import { mockDelay } from "@/lib/dev/devMode";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
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
  const { password: _password, ...user } = record;
  return user;
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
    // eslint-disable-next-line no-console
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
