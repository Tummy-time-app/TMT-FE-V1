import { mockDelay } from "@/lib/dev/devMode";
import { VENDORS, SHOP_VENDORS, MARKET_VENDORS } from "@/lib/vendordata";
import type { Vendor } from "@/features/vendors/types";

/** Every static seed vendor across all three business types — search spans restaurants, shops & markets alike. */
const ALL_VENDORS: Vendor[] = [...VENDORS, ...SHOP_VENDORS, ...MARKET_VENDORS];

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern. */
export async function mockSearchVendors(query: string): Promise<Vendor[]> {
  await mockDelay(350);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return ALL_VENDORS.filter(
    (v) =>
      v.approvalStatus === "approved" &&
      (v.name.toLowerCase().includes(q) ||
        v.cuisine.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q))
  ).sort((a, b) => b.rating - a.rating);
}
