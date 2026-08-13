import { mockDelay } from "@/lib/dev/devMode";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/features/addresses/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this follows. */

const ADDRESSES_STORAGE_KEY = "tummytime_mock_addresses";

type AddressStore = Record<string, Address[]>;

/** The demo customer starts with one saved address, matching checkout's old hardcoded default — so the address picker isn't empty on first load. */
function seedFor(userId: string): Address[] {
  if (userId !== "dev-customer-1") return [];
  return [
    {
      id: `addr-${userId}-seed`,
      userId,
      label: "Home",
      line1: "23 Awolowo Road",
      city: "Ikoyi",
      state: "Lagos",
      lat: 6.4531,
      lng: 3.4308,
      isDefault: true,
    },
  ];
}

function loadStore(): AddressStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ADDRESSES_STORAGE_KEY) ?? "{}") as AddressStore;
  } catch {
    return {};
  }
}

function saveStore(store: AddressStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(store));
}

function getOrSeed(store: AddressStore, userId: string): Address[] {
  if (!store[userId]) {
    store[userId] = seedFor(userId);
  }
  return store[userId];
}

export async function mockGetAddresses(userId: string): Promise<Address[]> {
  await mockDelay(300);
  const store = loadStore();
  return getOrSeed(store, userId);
}

export async function mockCreateAddress(userId: string, payload: CreateAddressPayload): Promise<Address> {
  await mockDelay(500);
  const store = loadStore();
  const existing = getOrSeed(store, userId);

  const address: Address = {
    id: `addr-${Date.now().toString(36)}`,
    userId,
    label: payload.label,
    line1: payload.line1,
    line2: payload.line2,
    city: payload.city,
    state: payload.state,
    lat: payload.lat,
    lng: payload.lng,
    // First address a user ever adds becomes their default automatically.
    isDefault: payload.isDefault ?? existing.length === 0,
  };

  const next = address.isDefault ? existing.map((a) => ({ ...a, isDefault: false })) : existing;
  store[userId] = [...next, address];
  saveStore(store);
  return address;
}

export async function mockUpdateAddress(userId: string, payload: UpdateAddressPayload): Promise<Address> {
  await mockDelay(400);
  const store = loadStore();
  const list = getOrSeed(store, userId);
  const idx = list.findIndex((a) => a.id === payload.id);
  if (idx === -1) throw { status: 404, message: "Address not found." };

  let next = list;
  if (payload.isDefault) {
    next = next.map((a) => ({ ...a, isDefault: a.id === payload.id }));
  }
  next = next.map((a) => (a.id === payload.id ? { ...a, ...payload } : a));

  store[userId] = next;
  saveStore(store);
  return next.find((a) => a.id === payload.id)!;
}

export async function mockDeleteAddress(userId: string, id: string): Promise<{ id: string }> {
  await mockDelay(400);
  const store = loadStore();
  const list = getOrSeed(store, userId);
  const wasDefault = list.find((a) => a.id === id)?.isDefault ?? false;
  let next = list.filter((a) => a.id !== id);

  // Deleting the default address promotes the next one, if any, so there's never a saved-but-unusable state.
  if (wasDefault && next.length > 0) {
    next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }

  store[userId] = next;
  saveStore(store);
  return { id };
}
