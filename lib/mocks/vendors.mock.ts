import { mockDelay } from "@/lib/dev/devMode";
import { CATEGORIES, VENDORS } from "@/lib/vendordata";
import { getRestaurantData } from "@/lib/restaurantData";
import { getVendorProductsInternal } from "./products.mock";
import type {
  Vendor,
  VendorApprovalStatus,
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

/** Admin approval-status changes overlay the static seed data — VENDORS itself never mutates. */
const VENDOR_STATUS_STORAGE_KEY = "tummytime_mock_vendor_status_overrides";

type StatusOverrides = Record<string, VendorApprovalStatus>;

function loadStatusOverrides(): StatusOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VENDOR_STATUS_STORAGE_KEY) ?? "{}") as StatusOverrides;
  } catch {
    return {};
  }
}

function saveStatusOverrides(overrides: StatusOverrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VENDOR_STATUS_STORAGE_KEY, JSON.stringify(overrides));
}

function resolveApprovalStatus(vendorId: string, overrides: StatusOverrides): VendorApprovalStatus {
  return overrides[vendorId] ?? VENDORS.find((v) => v.id === vendorId)?.approvalStatus ?? "approved";
}

function withResolvedStatus(vendor: Vendor, overrides: StatusOverrides): Vendor {
  return { ...vendor, approvalStatus: resolveApprovalStatus(vendor.id, overrides) };
}

export async function mockGetVendors(params: VendorQueryParams): Promise<VendorsResponse> {
  const { category, search, sort, freeDelivery, openNow, maxDeliveryTime, page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;

  // Pagination round-trips feel snappier than the initial load.
  await mockDelay(page > 1 ? 350 : 500);

  const overrides = loadStatusOverrides();
  // Customers only ever see approved vendors — a suspended vendor disappears from browse/search immediately.
  let list = VENDORS.map((v) => withResolvedStatus(v, overrides)).filter((v) => v.approvalStatus === "approved");

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

  const approvalStatus = resolveApprovalStatus(id, loadStatusOverrides());
  if (approvalStatus !== "approved") {
    throw { status: 404, message: "This vendor isn't available right now." };
  }

  // Menu items come from the mutable product store (seeded from `data.menuItems`
  // on first read), not straight from static seed data — so a vendor's edits
  // via /vendor/products show up here immediately.
  return {
    restaurant: { ...data.restaurant, approvalStatus },
    menuItems: getVendorProductsInternal(id),
  };
}

/** Admin — every vendor regardless of approval status. */
export async function mockGetAllVendorsAdmin(): Promise<Vendor[]> {
  await mockDelay(400);
  const overrides = loadStatusOverrides();
  return VENDORS.map((v) => withResolvedStatus(v, overrides));
}

/** Admin — approve/suspend/reactivate a vendor. Suspended vendors vanish from customer browse/search immediately. */
export async function mockSetVendorApprovalStatus(vendorId: string, status: VendorApprovalStatus): Promise<Vendor> {
  await mockDelay(500);
  const vendor = VENDORS.find((v) => v.id === vendorId);
  if (!vendor) throw { status: 404, message: "Vendor not found." };

  const overrides = loadStatusOverrides();
  overrides[vendorId] = status;
  saveStatusOverrides(overrides);

  return { ...vendor, approvalStatus: status };
}
