import { mockDelay } from "@/lib/dev/devMode";
import type { RiderProfile, VehicleType } from "@/features/rider/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors TMT-BE-V1's new rider_profiles table (services/user-service/src/
 * db/schema.ts) and riderRoutes.ts's profile endpoints. New mock signups
 * correctly land "pending" (matching the real backend's verification-gate
 * decision — see the rider-app implementation plan) with no way to become
 * verified from inside this app (no Admin dashboard exists). The one
 * exception is the seeded `dev-rider-1` demo account (lib/mocks/auth.mock.ts),
 * pre-verified here so the full delivery flow is actually testable in dev
 * mode without that Admin UI.
 * ═══════════════════════════════════════════════════════════════════════
 */

const RIDER_PROFILES_KEY = "tummytime_mock_rider_profiles";

function load(): Record<string, RiderProfile> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RIDER_PROFILES_KEY) ?? "{}") as Record<string, RiderProfile>;
  } catch {
    return {};
  }
}

function save(all: Record<string, RiderProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RIDER_PROFILES_KEY, JSON.stringify(all));
}

function defaultProfile(userId: string): RiderProfile {
  return {
    id: userId,
    userId,
    vehicleType: "motorcycle",
    plateNumber: null,
    verificationStatus: "pending",
    isOnline: false,
    rating: 5,
    currentLat: null,
    currentLng: null,
  };
}

export function getOrCreateRiderProfileSync(userId: string): RiderProfile {
  const all = load();
  if (!all[userId]) {
    all[userId] = defaultProfile(userId);
    save(all);
  }
  return all[userId];
}

/** Called once from auth.mock.ts's seedUsers() so the demo rider account is immediately usable. */
export function ensureSeededVerifiedRiderProfile(userId: string) {
  const all = load();
  if (!all[userId]) {
    all[userId] = { ...defaultProfile(userId), verificationStatus: "verified" };
    save(all);
  }
}

export async function mockGetRiderProfile(userId: string): Promise<RiderProfile> {
  await mockDelay();
  return getOrCreateRiderProfileSync(userId);
}

export async function mockUpdateRiderProfile(userId: string, updates: { vehicleType?: VehicleType; plateNumber?: string }): Promise<RiderProfile> {
  await mockDelay();
  const all = load();
  const current = all[userId] ?? defaultProfile(userId);
  all[userId] = { ...current, ...updates };
  save(all);
  return all[userId];
}

export async function mockSetOnlineStatus(userId: string, isOnline: boolean): Promise<RiderProfile> {
  await mockDelay(200);
  const all = load();
  const current = all[userId] ?? defaultProfile(userId);
  if (isOnline && current.verificationStatus !== "verified") {
    throw { status: 403, message: "Your rider account is still pending verification." };
  }
  all[userId] = { ...current, isOnline };
  save(all);
  return all[userId];
}
