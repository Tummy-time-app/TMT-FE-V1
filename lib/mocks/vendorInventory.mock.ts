import { mockDelay } from "@/lib/dev/devMode";
import type { InventorySummary, StockStatus, VendorMenuItem } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Shares lib/mocks/vendorMenu.mock.ts's localStorage key — inventory is
 * just a view over the same menu items, matching how the real backend
 * computes it (a query over the same `menu_items` table), not a separate
 * resource of its own.
 * ═══════════════════════════════════════════════════════════════════════
 */

const MENU_ITEMS_KEY = "tummytime_mock_vendor_menu_items";

function loadAll(): Record<string, VendorMenuItem[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(MENU_ITEMS_KEY) ?? "{}") as Record<string, VendorMenuItem[]>;
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, VendorMenuItem[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(data));
}

export async function mockGetInventory(
  restaurantId: string,
): Promise<{ summary: InventorySummary; items: VendorMenuItem[] }> {
  await mockDelay();
  const items = loadAll()[restaurantId] ?? [];
  const available = items.filter((i) => i.stockStatus === "AVAILABLE").length;
  const lowStock = items.filter((i) => i.stockStatus === "LOW_STOCK").length;
  const outOfStock = items.filter((i) => i.stockStatus === "OUT_OF_STOCK").length;
  return { summary: { total: items.length, available, lowStock, outOfStock }, items };
}

export async function mockUpdateStock(
  menuItemId: string,
  patch: { stockQuantity?: number; stockStatus?: StockStatus; available?: boolean },
): Promise<VendorMenuItem> {
  await mockDelay();
  const all = loadAll();

  for (const restaurantId of Object.keys(all)) {
    const idx = all[restaurantId].findIndex((i) => i.id === menuItemId);
    if (idx === -1) continue;

    // Mirrors vendor.ts's exact auto-status logic when only a quantity is sent.
    let stockStatus = patch.stockStatus;
    if (patch.stockQuantity !== undefined && !stockStatus) {
      stockStatus = patch.stockQuantity <= 0 ? "OUT_OF_STOCK" : patch.stockQuantity <= 10 ? "LOW_STOCK" : "AVAILABLE";
    }

    all[restaurantId][idx] = {
      ...all[restaurantId][idx],
      ...(patch.stockQuantity !== undefined && { stockQuantity: patch.stockQuantity }),
      ...(stockStatus && { stockStatus }),
      ...(patch.available !== undefined && { available: patch.available }),
      updatedAt: new Date().toISOString(),
    };
    saveAll(all);
    return all[restaurantId][idx];
  }

  throw { status: 404, message: "Menu item not found" };
}
