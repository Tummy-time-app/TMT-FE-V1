import { mockDelay } from "@/lib/dev/devMode";
import type { RiderProfile, UpdateRiderProfilePayload } from "@/features/riders/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this follows. */

const RIDER_PROFILE_STORAGE_KEY = "tummytime_mock_rider_profiles";
type ProfileStore = Record<string, RiderProfile>;

function loadStore(): ProfileStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RIDER_PROFILE_STORAGE_KEY) ?? "{}") as ProfileStore;
  } catch {
    return {};
  }
}

function saveStore(store: ProfileStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify(store));
}

function getOrInit(store: ProfileStore, userId: string, vehicleType: RiderProfile["vehicleType"]): RiderProfile {
  if (!store[userId]) {
    // Defaults to "approved" rather than the real-world "pending until documents are reviewed" —
    // no other feature in this build (claiming deliveries, going online, etc.) gates on
    // verificationStatus, so defaulting new/seeded riders to "pending" would just show a
    // confusing blocked-looking badge with no actual gate behind it.
    store[userId] = { userId, vehicleType, licenseNumber: "", idDocumentName: null, vehicleDocName: null, verificationStatus: "approved" };
    saveStore(store);
  }
  return store[userId];
}

export async function mockGetRiderProfile(userId: string, vehicleType: RiderProfile["vehicleType"]): Promise<RiderProfile> {
  await mockDelay(300);
  const store = loadStore();
  return getOrInit(store, userId, vehicleType);
}

export async function mockUpdateRiderProfile(userId: string, patch: UpdateRiderProfilePayload): Promise<RiderProfile> {
  await mockDelay(500);
  const store = loadStore();
  const current = getOrInit(store, userId, patch.vehicleType ?? "bike");
  const updated = { ...current, ...patch };
  store[userId] = updated;
  saveStore(store);
  return updated;
}

/** A fresh document upload re-queues the rider for verification — approving a resubmission isn't automatic. */
export async function mockUploadRiderDocument(
  userId: string,
  kind: "idDocument" | "vehicleDoc",
  fileName: string
): Promise<RiderProfile> {
  await mockDelay(700);
  const store = loadStore();
  const current = getOrInit(store, userId, "bike");
  const updated: RiderProfile = {
    ...current,
    idDocumentName: kind === "idDocument" ? fileName : current.idDocumentName,
    vehicleDocName: kind === "vehicleDoc" ? fileName : current.vehicleDocName,
    verificationStatus: "pending",
  };
  store[userId] = updated;
  saveStore(store);
  return updated;
}
