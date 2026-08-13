import { mockDelay } from "@/lib/dev/devMode";
import { getRestaurantData } from "@/lib/restaurantData";
import type { CreateCategoryPayload, ProductCategory, UpdateCategoryPayload } from "@/features/categories/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 * Seeded once per vendor from the static seed data's flat `categories:
 * string[]` (see lib/restaurantData.ts), then a real mutable store — same
 * "seed once, mutate after" relationship products.mock.ts has with menu
 * items.
 */

const CATEGORIES_STORAGE_KEY = "tummytime_mock_categories";
type CategoryStore = Record<string, ProductCategory[]>;

function loadStore(): CategoryStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CATEGORIES_STORAGE_KEY) ?? "{}") as CategoryStore;
  } catch {
    return {};
  }
}

function saveStore(store: CategoryStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(store));
}

function getOrSeed(store: CategoryStore, vendorId: string): ProductCategory[] {
  if (store[vendorId]) return store[vendorId];
  const seedNames = getRestaurantData(vendorId)?.restaurant.categories ?? [];
  const seeded = seedNames.map((name, i) => ({
    id: `cat-${vendorId}-${i}`,
    vendorId,
    name,
    sortOrder: i,
  }));
  store[vendorId] = seeded;
  saveStore(store);
  return seeded;
}

export async function mockGetCategories(vendorId: string): Promise<ProductCategory[]> {
  await mockDelay(300);
  const store = loadStore();
  return [...getOrSeed(store, vendorId)].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function mockCreateCategory({ vendorId, name }: CreateCategoryPayload): Promise<ProductCategory> {
  await mockDelay(400);
  const store = loadStore();
  const existing = getOrSeed(store, vendorId);
  const category: ProductCategory = {
    id: `cat-${vendorId}-${Date.now().toString(36)}`,
    vendorId,
    name,
    sortOrder: existing.length,
  };
  store[vendorId] = [...existing, category];
  saveStore(store);
  return category;
}

export async function mockUpdateCategory({ id, vendorId, name, sortOrder }: UpdateCategoryPayload): Promise<ProductCategory> {
  await mockDelay(350);
  const store = loadStore();
  const list = getOrSeed(store, vendorId);
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) throw { status: 404, message: "Category not found." };
  const updated = { ...list[idx], ...(name !== undefined ? { name } : {}), ...(sortOrder !== undefined ? { sortOrder } : {}) };
  const next = [...list];
  next[idx] = updated;
  store[vendorId] = next;
  saveStore(store);
  return updated;
}

export async function mockDeleteCategory(vendorId: string, id: string): Promise<{ id: string }> {
  await mockDelay(350);
  const store = loadStore();
  const list = getOrSeed(store, vendorId);
  store[vendorId] = list.filter((c) => c.id !== id);
  saveStore(store);
  return { id };
}
