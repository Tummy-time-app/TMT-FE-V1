import { mockDelay } from "@/lib/dev/devMode";
import type { AuthResponse, AuthSession, LoginCredentials, RegisterPayload, User } from "@/features/auth/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors TMT-BE-V1's user-service response shapes and quirks (status
 * codes, error field names, the "GET /me loses `phone`" gap) as closely as
 * possible, so dev-mode behavior doesn't diverge from what you'll actually
 * see once NEXT_PUBLIC_API_URL points at the real backend. Only
 * lib/dev/devMode.ts-gated branches inside authApi.ts import from here.
 * ═══════════════════════════════════════════════════════════════════════
 */

interface MockUserRecord extends User {
  phone: string;
  password: string;
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
    },
    {
      id: "dev-owner-1",
      email: "vendor@tummytime.dev",
      name: "Gracehouse Kitchen",
      role: "restaurant_owner",
      phone: "+2348030000002",
      password: "password123",
    },
    {
      id: "dev-admin-1",
      email: "admin@tummytime.dev",
      name: "TummyTime Admin",
      role: "admin",
      phone: "+2348030000003",
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

/** Mirrors user-service's generateTokens() access-token lifetime (15m). */
function issueSession(userId: string): AuthSession {
  return {
    accessToken: `mock.${userId}.${Date.now()}`,
    refreshToken: `mock-refresh.${userId}.${Date.now()}`,
    expiresAt: Date.now() + 1000 * 60 * 15,
  };
}

function toPublicUser(record: MockUserRecord): User {
  return { id: record.id, email: record.email, name: record.name, role: record.role, phone: record.phone };
}

export async function mockLogin({ email, password }: LoginCredentials): Promise<AuthResponse> {
  await mockDelay();
  const users = loadUsers();
  const record = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!record || record.password !== password) {
    // Matches user-service/src/routes/auth.ts's exact status + message.
    throw { status: 401, message: "Invalid credentials" };
  }
  return { user: toPublicUser(record), session: issueSession(record.id) };
}

export async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
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
  };
  saveUsers([...users, record]);
  return { user: toPublicUser(record), session: issueSession(record.id) };
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
  // it never carried `phone`, so a session restore loses it. Mirrored here
  // on purpose so dev mode doesn't hide that gap until you're on the real API.
  const { phone: _phone, ...userWithoutPhone } = toPublicUser(record);
  return { user: userWithoutPhone, session: issueSession(record.id) };
}
