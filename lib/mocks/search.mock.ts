import { mockDelay } from "@/lib/dev/devMode";
import { VENDORS } from "@/lib/vendordata";
import type { Vendor } from "@/features/vendors/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern. */
export async function mockSearchVendors(query: string): Promise<Vendor[]> {
  await mockDelay(350);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.cuisine.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
  ).sort((a, b) => b.rating - a.rating);
}
