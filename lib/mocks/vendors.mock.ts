import { mockDelay } from "@/lib/dev/devMode";
import { CATEGORIES, VENDORS } from "@/lib/vendordata";
import { getRestaurantData } from "@/lib/restaurantData";
import { getVendorProductsInternal } from "./products.mock";
import type {
  VendorCategory,
  VendorDetail,
  VendorQueryParams,
  VendorsResponse,
} from "@/features/vendors/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this
 * follows. Filters/sorts the seed data in lib/vendordata.ts the same way a
 * real backend endpoint would, so vendorsApi's `query` branch is a drop-in
 * swap once `/vendors` exists for real.
 */

const DEFAULT_PAGE_SIZE = 6;

export async function mockGetVendors(params: VendorQueryParams): Promise<VendorsResponse> {
  const { category, search, sort, freeDelivery, openNow, maxDeliveryTime, page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;

  // Pagination round-trips feel snappier than the initial load.
  await mockDelay(page > 1 ? 350 : 500);

  let list = [...VENDORS];

  if (category && category !== "all") {
    list = list.filter((v) => v.category === category);
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((v) => v.name.toLowerCase().includes(q) || v.cuisine.toLowerCase().includes(q));
  }

  if (freeDelivery) list = list.filter((v) => v.deliveryFee === 0);
  if (openNow) list = list.filter((v) => v.isOpen);

  if (maxDeliveryTime && maxDeliveryTime > 0) {
    list = list.filter((v) => parseInt(v.deliveryTime.split("-")[1]) <= maxDeliveryTime);
  }

  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (sort === "delivery_time") list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
  if (sort === "delivery_fee") list.sort((a, b) => a.deliveryFee - b.deliveryFee);

  const featured = list.filter((v) => v.isFeatured);
  const rest = list.filter((v) => !v.isFeatured);

  return {
    featured,
    vendors: rest.slice(0, page * pageSize),
    total: rest.length,
  };
}

export async function mockGetVendorCategories(): Promise<VendorCategory[]> {
  await mockDelay(150);
  return CATEGORIES;
}

export async function mockGetVendorDetail(id: string): Promise<VendorDetail> {
  await mockDelay();
  const data = getRestaurantData(id);
  if (!data) {
    throw { status: 404, message: "We couldn't find this vendor." };
  }
  // Menu items come from the mutable product store (seeded from `data.menuItems`
  // on first read), not straight from static seed data — so a vendor's edits
  // via /vendor/products show up here immediately.
  return { restaurant: data.restaurant, menuItems: getVendorProductsInternal(id) };
}
