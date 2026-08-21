import { mockDelay } from "@/lib/dev/devMode";
import type {
  AuthResponse,
  AuthSession,
  LoginCredentials,
  RegisterPayload,
  RegisterResult,
  User,
} from "@/features/auth/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors TMT-BE-V1's user-service response shapes and quirks (status
 * codes, error field names, the "GET /me loses `phone`" gap, the
 * email-verification gate) as closely as possible, so dev-mode behavior
 * doesn't diverge from what you'll actually see once NEXT_PUBLIC_API_URL
 * points at the real backend. Only lib/dev/devMode.ts-gated branches inside
 * authApi.ts import from here.
 *
 * One deliberate shortcut: there's no real inbox to click a verification
 * link from in dev mode, so `mockRegister` marks the new account verified
 * in storage immediately after "sending" the email — the register response
 * itself still reports `requiresVerification: true` / unverified (so the
 * UI's check-your-email screen is exercisable), but a login right after
 * works without any extra step, instead of dead-ending the whole flow.
 * ═══════════════════════════════════════════════════════════════════════
 */

interface MockUserRecord extends User {
  phone: string;
  password: string;
  isEmailVerified: boolean;
}

const USERS_STORAGE_KEY = "tummytime_mock_users";

function seedUsers(): MockUserRecord[] {
  return [
    {
      id: "dev-customer-1",
      email: "demo@tummytime.dev",
      name: "Demo Customer",
      role: "customer",
      phone: "+2348030000001",
      password: "password123",
      isEmailVerified: true,
    },
    {
      id: "dev-owner-1",
      email: "vendor@tummytime.dev",
      name: "Gracehouse Kitchen",
      role: "restaurant_owner",
      phone: "+2348030000002",
      password: "password123",
      isEmailVerified: true,
    },
    {
      id: "dev-admin-1",
      email: "admin@tummytime.dev",
      name: "TummyTime Admin",
      role: "admin",
      phone: "+2348030000003",
      password: "password123",
      isEmailVerified: true,
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

/** Mirrors user-service's generateTokens() access-token lifetime (15m). */
function issueSession(userId: string): AuthSession {
  return {
    accessToken: `mock.${userId}.${Date.now()}`,
    refreshToken: `mock-refresh.${userId}.${Date.now()}`,
    expiresAt: Date.now() + 1000 * 60 * 15,
  };
}

function toPublicUser(record: MockUserRecord): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    phone: record.phone,
    isEmailVerified: record.isEmailVerified,
  };
}

export async function mockLogin({ email, password }: LoginCredentials): Promise<AuthResponse> {
  await mockDelay();
  const users = loadUsers();
  const record = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!record || record.password !== password) {
    // Matches user-service/src/routes/auth.ts's exact status + message.
    throw { status: 401, message: "Invalid credentials" };
  }
  if (!record.isEmailVerified) {
    // Matches the real 403 UnverifiedLoginError shape exactly (see
    // toQueryError's `...rest` passthrough and features/auth/types.ts).
    throw {
      status: 403,
      message: "Please verify your account. A verification link was sent to your email.",
      requiresVerification: true,
      email: record.email,
    };
  }
  return { user: toPublicUser(record), session: issueSession(record.id) };
}

export async function mockRegister(payload: RegisterPayload): Promise<RegisterResult> {
  await mockDelay();
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
    // Matches user-service's exact status + message (409, "User already exists").
    throw { status: 409, message: "User already exists" };
  }
  const record: MockUserRecord = {
    id: `dev-${payload.role ?? "customer"}-${Date.now()}`,
    email: payload.email.trim(),
    name: payload.name,
    phone: payload.phone,
    role: payload.role ?? "customer",
    password: payload.password,
    // Marked verified in storage right away — see this file's doc comment
    // on why (no real inbox to click a link from in dev mode) — but the
    // response below still reports unverified so the UI's check-your-email
    // screen is reachable in dev.
    isEmailVerified: true,
  };
  saveUsers([...users, record]);
  return {
    message: "An email has been sent to you, please verify your account.",
    requiresVerification: true,
    user: { ...toPublicUser(record), isEmailVerified: false },
  };
}

export async function mockResendVerification(email: string): Promise<{ message: string }> {
  await mockDelay(300);
  const users = loadUsers();
  const record = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!record) {
    throw { status: 404, message: "User not found" };
  }
  if (record.isEmailVerified) {
    // Always true in dev mode per mockRegister's shortcut, but mirrored
    // here anyway so this endpoint's error shape matches the real one.
    throw { status: 400, message: "Account is already verified. You can log in." };
  }
  return { message: "An email has been sent to you, please verify your account." };
}

export async function mockGetSession(accessToken: string): Promise<AuthResponse> {
  await mockDelay(250);
  const userId = accessToken.split(".")[1];
  const users = loadUsers();
  const record = users.find((u) => u.id === userId);
  if (!record) {
    // Matches GET /users/me's exact status + message.
    throw { status: 401, message: "Invalid or expired access token" };
  }
  // Real GET /users/me only decodes the JWT payload (id/email/name/role) —
  // it never carried `phone` or `isEmailVerified`, so a session restore
  // loses both. Mirrored here on purpose so dev mode doesn't hide that gap
  // until you're on the real API.
  const { phone: _phone, isEmailVerified: _isEmailVerified, ...userWithoutExtras } = toPublicUser(record);
  return { user: userWithoutExtras, session: issueSession(record.id) };
}
