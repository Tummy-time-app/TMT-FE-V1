import { mockDelay } from "@/lib/dev/devMode";
import type {
  CreateStorePayload,
  StoreStatus,
  UpdateStoreProfilePayload,
  VendorRestaurant,
} from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * localStorage-backed, mirroring restaurant-service's actual create/update
 * logic (defaults, the 409-on-duplicate-name-per-owner check) — separate
 * from lib/mocks/restaurants.mock.ts's fixed customer-facing seed list,
 * which stays read-only. Vendor-created mock stores don't show up in that
 * customer browsing mock yet — a reasonable gap for this phase, not a
 * bug; call it out if full round-trip visibility matters before the real
 * backend is wired up.
 * ═══════════════════════════════════════════════════════════════════════
 */

const STORAGE_KEY = "tummytime_mock_vendor_stores";

function loadStores(): VendorRestaurant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as VendorRestaurant[];
  } catch {
    return [];
  }
}

function saveStores(stores: VendorRestaurant[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
}

export async function mockGetMyStores(ownerId: string): Promise<VendorRestaurant[]> {
  await mockDelay();
  return loadStores().filter((s) => s.ownerId === ownerId);
}

export async function mockCreateStore(payload: CreateStorePayload): Promise<VendorRestaurant> {
  await mockDelay();
  const stores = loadStores();
  if (stores.some((s) => s.ownerId === payload.ownerId && s.name.toLowerCase() === payload.name.toLowerCase())) {
    // Matches restaurant-service's exact status + message.
    throw { status: 409, message: "A restaurant with this name already exists for this owner" };
  }

  const now = new Date().toISOString();
  const store: VendorRestaurant = {
    id: crypto.randomUUID(),
    ownerId: payload.ownerId,
    name: payload.name,
    businessType: "restaurant",
    businessCategory: "General",
    address: payload.address,
    phone: payload.phone || "",
    cuisine: payload.cuisine || "General",
    rating: "5.0",
    imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    storeStatus: "OPEN",
    isOpen: true,
    verificationStatus: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
  saveStores([...stores, store]);
  return store;
}

export async function mockUpdateStoreProfile({ id, patch }: UpdateStoreProfilePayload): Promise<VendorRestaurant> {
  await mockDelay();
  const stores = loadStores();
  const idx = stores.findIndex((s) => s.id === id);
  if (idx === -1) throw { status: 404, message: "Store not found" };
  stores[idx] = {
    ...stores[idx],
    ...patch,
    isOpen: patch.storeStatus ? patch.storeStatus === "OPEN" : stores[idx].isOpen,
    updatedAt: new Date().toISOString(),
  };
  saveStores(stores);
  return stores[idx];
}

export async function mockUpdateStoreStatus(
  id: string,
  storeStatus: StoreStatus,
): Promise<{ storeStatus: StoreStatus; isOpen: boolean }> {
  await mockDelay();
  const stores = loadStores();
  const idx = stores.findIndex((s) => s.id === id);
  if (idx === -1) throw { status: 404, message: "Store not found" };
  stores[idx] = { ...stores[idx], storeStatus, isOpen: storeStatus === "OPEN", updatedAt: new Date().toISOString() };
  saveStores(stores);
  return { storeStatus: stores[idx].storeStatus, isOpen: stores[idx].isOpen };
}

export async function mockToggleStoreOpen(id: string): Promise<VendorRestaurant> {
  await mockDelay();
  const stores = loadStores();
  const idx = stores.findIndex((s) => s.id === id);
  if (idx === -1) throw { status: 404, message: "Store not found" };
  stores[idx] = { ...stores[idx], isOpen: !stores[idx].isOpen, updatedAt: new Date().toISOString() };
  saveStores(stores);
  return stores[idx];
}
