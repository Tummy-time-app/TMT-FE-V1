import { mockDelay } from "@/lib/dev/devMode";
import { BASE_RESTAURANTS } from "./restaurants.mock";
import type { Restaurant } from "@/features/restaurants/types";
import type { Paginated } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * restaurants.mock.ts's seed list is a plain static array (read by the
 * customer-facing browsing screens too) — rather than making that
 * mutable and risking those screens, admin approve/reject/delete actions
 * are tracked as a small overlay here, merged onto the base list at read
 * time. Mirrors adminRestaurants.ts's real GET / + PATCH /:id/approval +
 * DELETE /:id.
 * ═══════════════════════════════════════════════════════════════════════
 */

const OVERRIDES_KEY = "tummytime_mock_admin_vendor_overrides";

type VendorOverride = Partial<Pick<Restaurant, "verificationStatus" | "storeStatus" | "isOpen">> & { deleted?: boolean };

function loadOverrides(): Record<string, VendorOverride> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(OVERRIDES_KEY) ?? "{}") as Record<string, VendorOverride>;
  } catch {
    return {};
  }
}

function saveOverrides(all: Record<string, VendorOverride>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
}

function mergedVendors(): Restaurant[] {
  const overrides = loadOverrides();
  return BASE_RESTAURANTS.filter((r) => !overrides[r.id]?.deleted).map((r) => ({ ...r, ...overrides[r.id] }));
}

export async function mockListVendors(page: number, limit: number): Promise<Paginated<Restaurant>> {
  await mockDelay();
  const all = mergedVendors();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) } };
}

export async function mockUpdateVendorApproval(
  id: string,
  updates: { verificationStatus?: Restaurant["verificationStatus"]; storeStatus?: string; approved?: boolean }
): Promise<Restaurant> {
  await mockDelay();
  const overrides = loadOverrides();
  overrides[id] = {
    ...overrides[id],
    ...(updates.verificationStatus && { verificationStatus: updates.verificationStatus }),
    ...(updates.storeStatus && { storeStatus: updates.storeStatus }),
    ...(updates.approved !== undefined && { isOpen: updates.approved }),
  };
  saveOverrides(overrides);
  const vendor = mergedVendors().find((r) => r.id === id);
  if (!vendor) throw { status: 404, message: "Restaurant not found" };
  return vendor;
}

export async function mockDeleteVendor(id: string): Promise<void> {
  await mockDelay();
  const overrides = loadOverrides();
  overrides[id] = { ...overrides[id], deleted: true };
  saveOverrides(overrides);
}
