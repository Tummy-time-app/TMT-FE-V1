import { mockDelay } from "@/lib/dev/devMode";
import { getRestaurantData } from "@/lib/restaurantData";
import type { MenuItem } from "@/features/vendors/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * The canonical, *mutable* source of truth for a vendor's menu items.
 * Seeded once per vendor from lib/restaurantData.ts's static seed data,
 * then lives in localStorage. lib/mocks/vendors.mock.ts's
 * mockGetVendorDetail reads from here too, so a vendor editing their
 * menu shows up on the public vendor page immediately.
 */

const PRODUCTS_STORAGE_KEY = "tummytime_mock_products";

type ProductStore = Record<string, MenuItem[]>;

function loadStore(): ProductStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PRODUCTS_STORAGE_KEY) ?? "{}") as ProductStore;
  } catch {
    return {};
  }
}

function saveStore(store: ProductStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(store));
}

/** Seeds + returns a vendor's product list. Synchronous — used by other mocks too (no artificial delay). */
export function getVendorProductsInternal(vendorId: string): MenuItem[] {
  const store = loadStore();
  if (store[vendorId]) return store[vendorId];

  const seeded = getRestaurantData(vendorId)?.menuItems ?? [];
  store[vendorId] = seeded;
  saveStore(store);
  return seeded;
}

export async function mockGetVendorProducts(vendorId: string): Promise<MenuItem[]> {
  await mockDelay(350);
  return getVendorProductsInternal(vendorId);
}

export async function mockCreateProduct(vendorId: string, payload: Omit<MenuItem, "id">): Promise<MenuItem> {
  await mockDelay(600);
  const store = loadStore();
  const list = store[vendorId] ?? getVendorProductsInternal(vendorId);
  const nextId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
  const product: MenuItem = { ...payload, id: nextId };
  store[vendorId] = [...list, product];
  saveStore(store);
  return product;
}

export async function mockUpdateProduct(
  vendorId: string,
  id: number,
  patch: Partial<Omit<MenuItem, "id">>
): Promise<MenuItem> {
  await mockDelay(500);
  const store = loadStore();
  const list = store[vendorId] ?? getVendorProductsInternal(vendorId);
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) throw { status: 404, message: "Product not found." };

  const updated = { ...list[idx], ...patch };
  const next = [...list];
  next[idx] = updated;
  store[vendorId] = next;
  saveStore(store);
  return updated;
}

export async function mockDeleteProduct(vendorId: string, id: number): Promise<{ id: number }> {
  await mockDelay(400);
  const store = loadStore();
  const list = store[vendorId] ?? getVendorProductsInternal(vendorId);
  store[vendorId] = list.filter((i) => i.id !== id);
  saveStore(store);
  return { id };
}
