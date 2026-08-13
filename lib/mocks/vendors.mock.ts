import { mockDelay } from "@/lib/dev/devMode";
import { CATEGORIES, VENDORS } from "@/lib/vendordata";
import { getRestaurantData } from "@/lib/restaurantData";
import { getVendorProductsInternal } from "./products.mock";
import { deriveVendorRatingInternal } from "./reviews.mock";
import { setUserVendorIdInternal } from "./auth.mock";
import type {
  CreateVendorPayload,
  Vendor,
  VendorApprovalStatus,
  VendorCategory,
  VendorDetail,
  VendorQueryParams,
  VendorSummary,
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

/**
 * Vendors created at runtime via onboarding (see `mockCreateVendor` below) —
 * `lib/vendordata.ts`'s `VENDORS` is static seed data and never mutates, so
 * a brand-new store needs somewhere else to live. Every list/detail/mutation
 * function below reads through `allVendors()`/`findVendorRaw()` rather than
 * `VENDORS` directly, so a dynamically-created vendor behaves identically to
 * a seeded one everywhere (browse, admin approval, temporarily-closed...).
 */
const DYNAMIC_VENDORS_STORAGE_KEY = "tummytime_mock_dynamic_vendors";
type DynamicVendorStore = Record<string, Vendor>;

function loadDynamicVendors(): DynamicVendorStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DYNAMIC_VENDORS_STORAGE_KEY) ?? "{}") as DynamicVendorStore;
  } catch {
    return {};
  }
}

function saveDynamicVendors(store: DynamicVendorStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DYNAMIC_VENDORS_STORAGE_KEY, JSON.stringify(store));
}

function allVendors(): Vendor[] {
  return [...VENDORS, ...Object.values(loadDynamicVendors())];
}

function findVendorRaw(id: string): Vendor | undefined {
  return loadDynamicVendors()[id] ?? VENDORS.find((v) => v.id === id);
}

function resolveApprovalStatus(vendorId: string, overrides: StatusOverrides): VendorApprovalStatus {
  return overrides[vendorId] ?? findVendorRaw(vendorId)?.approvalStatus ?? "approved";
}

/** Vendor-toggled "closed today" flag — maps to `vendors.is_temporarily_closed`. Same overlay pattern as approval status. */
const VENDOR_CLOSED_STORAGE_KEY = "tummytime_mock_vendor_closed_overrides";
type ClosedOverrides = Record<string, boolean>;

function loadClosedOverrides(): ClosedOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VENDOR_CLOSED_STORAGE_KEY) ?? "{}") as ClosedOverrides;
  } catch {
    return {};
  }
}

function saveClosedOverrides(overrides: ClosedOverrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VENDOR_CLOSED_STORAGE_KEY, JSON.stringify(overrides));
}

/** No per-vendor override in seed data — every vendor pays the same flat platform default in dev mode. */
const DEFAULT_COMMISSION_RATE = 0.15;

/** Vendor-set weekly hours — maps to `vendors.operating_hours`. Same overlay pattern as approval status/closed. */
const VENDOR_HOURS_STORAGE_KEY = "tummytime_mock_vendor_hours_overrides";
type HoursOverrides = Record<string, Vendor["operatingHours"]>;

function loadHoursOverrides(): HoursOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VENDOR_HOURS_STORAGE_KEY) ?? "{}") as HoursOverrides;
  } catch {
    return {};
  }
}

function saveHoursOverrides(overrides: HoursOverrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VENDOR_HOURS_STORAGE_KEY, JSON.stringify(overrides));
}

function withResolvedStatus(vendor: Vendor, overrides: StatusOverrides): Vendor {
  const closedOverrides = loadClosedOverrides();
  const isTemporarilyClosed = closedOverrides[vendor.id] ?? false;
  // Once a vendor has real reviews, its rating/count are live-derived from them instead of the static seed numbers.
  const { rating, reviewCount } = deriveVendorRatingInternal(vendor.id, { rating: vendor.rating, reviewCount: vendor.reviewCount });
  return {
    ...vendor,
    rating,
    reviewCount,
    approvalStatus: resolveApprovalStatus(vendor.id, overrides),
    isTemporarilyClosed,
    // A vendor-toggled "closed for today" overrides the operating-hours-derived isOpen — customers see it immediately.
    isOpen: isTemporarilyClosed ? false : vendor.isOpen,
    commissionRate: vendor.commissionRate ?? DEFAULT_COMMISSION_RATE,
    businessType: vendor.businessType ?? "restaurant",
    operatingHours: loadHoursOverrides()[vendor.id] ?? vendor.operatingHours,
  };
}

export async function mockGetVendors(params: VendorQueryParams): Promise<VendorsResponse> {
  const { category, search, sort, freeDelivery, openNow, maxDeliveryTime, page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;

  // Pagination round-trips feel snappier than the initial load.
  await mockDelay(page > 1 ? 350 : 500);

  const overrides = loadStatusOverrides();
  // Customers only ever see approved vendors — a suspended (or still-pending onboarding) vendor disappears from browse/search immediately.
  let list = allVendors().map((v) => withResolvedStatus(v, overrides)).filter((v) => v.approvalStatus === "approved");

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

/** Builds a full `VendorSummary` for a dynamically-created (onboarded) vendor — `lib/restaurantData.ts` only has entries for the static seed vendors. */
function dynamicVendorToSummary(v: Vendor, approvalStatus: VendorApprovalStatus, isTemporarilyClosed: boolean): VendorSummary {
  const { rating, reviewCount } = deriveVendorRatingInternal(v.id, { rating: v.rating, reviewCount: v.reviewCount });
  return {
    id: v.id,
    name: v.name,
    tagline: v.description || v.cuisine,
    rating,
    reviews: reviewCount,
    deliveryTime: v.deliveryTime,
    deliveryFee: v.deliveryFee,
    minOrder: v.minOrder,
    isOpen: isTemporarilyClosed ? false : v.isOpen,
    image: v.image,
    logo: v.image,
    tags: [v.cuisine],
    categories: [v.category],
    location: v.location,
    approvalStatus,
    isTemporarilyClosed,
    businessType: v.businessType ?? "restaurant",
    commissionRate: v.commissionRate ?? DEFAULT_COMMISSION_RATE,
    operatingHours: loadHoursOverrides()[v.id] ?? v.operatingHours,
  };
}

export async function mockGetVendorDetail(id: string): Promise<VendorDetail> {
  await mockDelay();

  const approvalStatus = resolveApprovalStatus(id, loadStatusOverrides());
  const isTemporarilyClosed = loadClosedOverrides()[id] ?? false;

  const dynamicVendor = loadDynamicVendors()[id];
  if (dynamicVendor) {
    if (approvalStatus !== "approved") {
      throw { status: 404, message: "This vendor isn't available right now." };
    }
    return {
      restaurant: dynamicVendorToSummary(dynamicVendor, approvalStatus, isTemporarilyClosed),
      menuItems: getVendorProductsInternal(id),
    };
  }

  const data = getRestaurantData(id);
  if (!data) {
    throw { status: 404, message: "We couldn't find this vendor." };
  }
  if (approvalStatus !== "approved") {
    throw { status: 404, message: "This vendor isn't available right now." };
  }

  // Menu items come from the mutable product store (seeded from `data.menuItems`
  // on first read), not straight from static seed data — so a vendor's edits
  // via /vendor/products show up here immediately.
  const { rating, reviewCount } = deriveVendorRatingInternal(id, { rating: data.restaurant.rating, reviewCount: data.restaurant.reviews });
  return {
    restaurant: {
      ...data.restaurant,
      rating,
      reviews: reviewCount,
      approvalStatus,
      isTemporarilyClosed,
      isOpen: isTemporarilyClosed ? false : data.restaurant.isOpen,
      commissionRate: DEFAULT_COMMISSION_RATE,
      businessType: "restaurant" as const,
      operatingHours: loadHoursOverrides()[id],
    },
    menuItems: getVendorProductsInternal(id),
  };
}

/** Admin — every vendor regardless of approval status. */
export async function mockGetAllVendorsAdmin(): Promise<Vendor[]> {
  await mockDelay(400);
  const overrides = loadStatusOverrides();
  return allVendors().map((v) => withResolvedStatus(v, overrides));
}

/** Admin — approve/suspend/reactivate a vendor. Suspended vendors vanish from customer browse/search immediately. */
export async function mockSetVendorApprovalStatus(vendorId: string, status: VendorApprovalStatus): Promise<Vendor> {
  await mockDelay(500);
  const vendor = findVendorRaw(vendorId);
  if (!vendor) throw { status: 404, message: "Vendor not found." };

  const overrides = loadStatusOverrides();
  overrides[vendorId] = status;
  saveStatusOverrides(overrides);

  return { ...vendor, approvalStatus: status };
}

/** Vendor self-service — toggle "closed for the rest of today" without touching approval status or operating hours. */
export async function mockSetVendorTemporarilyClosed(vendorId: string, closed: boolean): Promise<Vendor> {
  await mockDelay(350);
  const vendor = findVendorRaw(vendorId);
  if (!vendor) throw { status: 404, message: "Vendor not found." };

  const overrides = loadClosedOverrides();
  overrides[vendorId] = closed;
  saveClosedOverrides(overrides);

  return withResolvedStatus(vendor, loadStatusOverrides());
}

/** Doc §5, VendorsModule: `PATCH /vendors/:id/hours`. */
export async function mockSetVendorOperatingHours(vendorId: string, hours: Vendor["operatingHours"]): Promise<Vendor> {
  await mockDelay(500);
  const vendor = findVendorRaw(vendorId);
  if (!vendor) throw { status: 404, message: "Vendor not found." };

  const overrides = loadHoursOverrides();
  overrides[vendorId] = hours;
  saveHoursOverrides(overrides);

  return withResolvedStatus(vendor, loadStatusOverrides());
}

/**
 * Doc §5, VendorsModule: `POST /vendors` — "Vendor onboarding". Registering
 * with role "vendor" only creates the account; this is the second step that
 * creates the actual storefront and links it back to the owner's profile,
 * closing the gap where `/vendor` used to dead-end on "no vendor linked".
 * New stores start `pending` — an admin still has to approve them, same as
 * every other approval-status transition in this mock.
 */
export async function mockCreateVendor(ownerId: string, payload: CreateVendorPayload): Promise<Vendor> {
  await mockDelay(800);

  const dynamic = loadDynamicVendors();
  const id = `vendor-${Date.now().toString(36)}`;
  const vendor: Vendor = {
    id,
    name: payload.name,
    image: payload.image,
    cuisine: payload.cuisine,
    category: payload.category,
    rating: 0,
    reviewCount: 0,
    deliveryTime: "30-45",
    deliveryFee: 500,
    minOrder: 1000,
    priceRange: 2,
    isOpen: true,
    isNew: true,
    isFeatured: false,
    location: payload.location,
    approvalStatus: "pending",
    businessType: payload.businessType,
    description: payload.description,
  };

  dynamic[id] = vendor;
  saveDynamicVendors(dynamic);
  setUserVendorIdInternal(ownerId, id);

  return vendor;
}
