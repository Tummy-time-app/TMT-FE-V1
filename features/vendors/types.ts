import type { LatLng } from "@/lib/maps/types";
import type { IconComponent } from "@/components/icons";

export type VendorApprovalStatus = "pending" | "approved" | "suspended";

/** Maps to `vendors.type` — the three storefront kinds the app connects to consumers. */
export type VendorBusinessType = "restaurant" | "shop" | "market";

/** One day's open/close windows — `vendors.operating_hours` jsonb, e.g. `{ mon: [{open,close}], ... }`. */
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type OperatingHours = Partial<Record<DayOfWeek, { open: string; close: string }[]>>;

export type Vendor = {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  priceRange: 1 | 2 | 3;
  isOpen: boolean;
  isNew: boolean;
  isFeatured: boolean;
  promoLabel?: string;
  location: LatLng;
  approvalStatus: VendorApprovalStatus;
  /** Maps to `vendors.type`. Optional — defaults to "restaurant" for existing seed data (see lib/vendordata.ts). */
  businessType?: VendorBusinessType;
  /** Maps to `vendors.is_temporarily_closed` — vendor-toggled, distinct from `isOpen` (which reflects operating hours). */
  isTemporarilyClosed?: boolean;
  /** Maps to `vendors.commission_rate` — per-vendor override of the platform default; surfaced read-only on the vendor dashboard. */
  commissionRate?: number;
  operatingHours?: OperatingHours;
  /** Maps to `vendors.description`. */
  description?: string;
};

export type VendorCategory = {
  id: string;
  label: string;
  icon: IconComponent;
  gradient: string;
};

/** Maps to `products.product_type` — grocery-specific handling isn't built (Shops/groceries are "Coming soon" everywhere else in the app), but the field is modeled for contract completeness. */
export type ProductType = "menu_item" | "grocery_item";
export type ProductUnitType = "each" | "weight";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  /** Maps to `products.compare_at_price` — a struck-through "was" price, shown when set and higher than `price`. */
  compareAtPrice?: number;
  image: string;
  category: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  available: boolean;
  productType?: ProductType;
  unitType?: ProductUnitType;
  weightUnit?: "g" | "kg";
  /** Maps to `products.stock_quantity` — null/undefined for made-to-order menu items that don't track a count (the common case here; `available` alone gates ordering). */
  stockQuantity?: number | null;
  trackInventory?: boolean;
  /** Grocery: allow a substitution if out of stock at fulfillment time. */
  substitutionAllowed?: boolean;
}

export interface VendorSummary {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address?: string;
  isOpen: boolean;
  openHours?: string;
  image: string;
  logo: string;
  tags: string[];
  categories: string[];
  location: LatLng;
  approvalStatus: VendorApprovalStatus;
  businessType?: VendorBusinessType;
  isTemporarilyClosed?: boolean;
  commissionRate?: number;
  operatingHours?: OperatingHours;
}

export interface VendorDetail {
  restaurant: VendorSummary;
  menuItems: MenuItem[];
}

export type VendorSortKey = "recommended" | "rating" | "delivery_time" | "delivery_fee";

export interface VendorQueryParams {
  businessType?: VendorBusinessType;
  category?: string;
  search?: string;
  sort?: VendorSortKey;
  freeDelivery?: boolean;
  openNow?: boolean;
  /** Only include vendors whose max ETA is at or under this many minutes. */
  maxDeliveryTime?: number;
  page?: number;
  pageSize?: number;
}

export interface VendorsResponse {
  /** Always returned in full — never paginated. */
  featured: Vendor[];
  /** Paginated (accumulates as `page` grows, matching the "View more" pattern). */
  vendors: Vendor[];
  /** Total non-featured vendors matching the query, for the "N restaurants" count + hasMore. */
  total: number;
}

/** Doc §5, VendorsModule: `POST /vendors` — "Vendor onboarding". */
export interface CreateVendorPayload {
  name: string;
  cuisine: string;
  category: string;
  businessType: VendorBusinessType;
  description: string;
  image: string;
  location: LatLng;
}
