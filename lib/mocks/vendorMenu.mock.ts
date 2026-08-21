import { mockDelay } from "@/lib/dev/devMode";
import type { MenuItem } from "@/features/restaurants/types";
import type {
  Category,
  CreateCategoryPayload,
  CreateExtraPayload,
  CreateMenuItemPayload,
  CreateVariantPayload,
  ProductExtra,
  ProductVariant,
} from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * localStorage-backed, mirroring vendor.ts/restaurants.ts's actual
 * create logic (defaults, 400/409 checks). Menu items created here are
 * exported via `getVendorMenuItemsForRestaurant` so
 * lib/mocks/restaurants.mock.ts's customer-facing mockGetMenu can merge
 * them in — a vendor's added item actually shows up to customers browsing
 * their store in mock mode, not just in the vendor's own view.
 * ═══════════════════════════════════════════════════════════════════════
 */

const CATEGORIES_KEY = "tummytime_mock_categories";
const MENU_ITEMS_KEY = "tummytime_mock_vendor_menu_items";
const VARIANTS_KEY = "tummytime_mock_variants";
const EXTRAS_KEY = "tummytime_mock_extras";

function load<T>(key: string): Record<string, T[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, T[]>;
  } catch {
    return {};
  }
}

function save<T>(key: string, data: Record<string, T[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(data));
}

export async function mockGetCategories(restaurantId: string): Promise<Category[]> {
  await mockDelay();
  const all = load<Category>(CATEGORIES_KEY);
  return (all[restaurantId] ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function mockCreateCategory(payload: CreateCategoryPayload): Promise<Category> {
  await mockDelay();
  const all = load<Category>(CATEGORIES_KEY);
  const existing = all[payload.restaurantId] ?? [];
  if (existing.some((c) => c.name.toLowerCase() === payload.name.toLowerCase())) {
    throw { status: 409, message: "A category with this name already exists in this restaurant" };
  }
  const category: Category = {
    id: crypto.randomUUID(),
    restaurantId: payload.restaurantId,
    name: payload.name,
    displayOrder: payload.displayOrder ?? existing.length,
    createdAt: new Date().toISOString(),
  };
  all[payload.restaurantId] = [...existing, category];
  save(CATEGORIES_KEY, all);
  return category;
}

/** Read-only export for restaurants.mock.ts to merge into customer-facing menu results. */
export function getVendorMenuItemsForRestaurant(restaurantId: string): MenuItem[] {
  return load<MenuItem>(MENU_ITEMS_KEY)[restaurantId] ?? [];
}

export async function mockCreateMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
  await mockDelay();
  const all = load<MenuItem>(MENU_ITEMS_KEY);
  const existing = all[payload.restaurantId] ?? [];
  if (existing.some((i) => i.name.toLowerCase() === payload.name.toLowerCase())) {
    throw { status: 409, message: "A menu item with this name already exists in this restaurant" };
  }
  const now = new Date().toISOString();
  // Includes stockQuantity/stockStatus/lowStockThreshold (VendorMenuItem
  // fields, not on the thin MenuItem type) matching the real DB row's
  // defaults — lib/mocks/vendorInventory.mock.ts reads these back.
  const item = {
    id: crypto.randomUUID(),
    restaurantId: payload.restaurantId,
    name: payload.name,
    description: payload.description || "",
    price: String(payload.price),
    category: payload.category || "Main",
    imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    available: true,
    stockQuantity: 100,
    lowStockThreshold: 10,
    stockStatus: "AVAILABLE" as const,
    createdAt: now,
    updatedAt: now,
  };
  all[payload.restaurantId] = [...existing, item];
  save(MENU_ITEMS_KEY, all);
  return item;
}

export async function mockCreateVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
  await mockDelay();
  if (!payload.name || payload.price === undefined) {
    throw { status: 400, message: "Variant name and price are required" };
  }
  const all = load<ProductVariant>(VARIANTS_KEY);
  const variant: ProductVariant = {
    id: crypto.randomUUID(),
    menuItemId: payload.menuItemId,
    name: payload.name,
    price: String(payload.price),
    available: payload.available ?? true,
    createdAt: new Date().toISOString(),
  };
  all[payload.menuItemId] = [...(all[payload.menuItemId] ?? []), variant];
  save(VARIANTS_KEY, all);
  return variant;
}

export async function mockCreateExtra(payload: CreateExtraPayload): Promise<ProductExtra> {
  await mockDelay();
  if (!payload.name || payload.price === undefined) {
    throw { status: 400, message: "Extra name and price are required" };
  }
  const all = load<ProductExtra>(EXTRAS_KEY);
  const extra: ProductExtra = {
    id: crypto.randomUUID(),
    menuItemId: payload.menuItemId,
    name: payload.name,
    price: String(payload.price),
    isRequired: payload.isRequired ?? false,
    available: payload.available ?? true,
    createdAt: new Date().toISOString(),
  };
  all[payload.menuItemId] = [...(all[payload.menuItemId] ?? []), extra];
  save(EXTRAS_KEY, all);
  return extra;
}
