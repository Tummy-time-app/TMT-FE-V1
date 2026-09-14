import type { MenuItem } from "@/features/restaurants/types";
import type { Order } from "@/features/orders/types";

/**
 * The vendor's own view of their store — mirrors TMT-BE-V1's full
 * `restaurants` DB row (services/restaurant-service/src/db/schema.ts),
 * much richer than features/restaurants/types.ts's `Restaurant` (the
 * thin, read-only shape customer-facing browsing uses).
 */
export type BusinessType = "restaurant" | "grocery" | "retail" | "other";
export type StoreStatus = "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** Free-form on the real backend (a jsonb column, no enforced shape) — treat every field as optional/unknown-tolerant on read. */
export interface VerificationDocs {
  businessId?: string;
  govId?: string;
  regDoc?: string;
  bankDetails?: string;
  storeImages?: string[];
}

export interface VendorRestaurant {
  id: string;
  ownerId: string;
  name: string;
  businessType: BusinessType;
  businessCategory?: string | null;
  ownerName?: string | null;
  address: string;
  landmark?: string | null;
  state?: string | null;
  city?: string | null;
  additionalDirections?: string | null;
  phone?: string | null;
  email?: string | null;
  cuisine?: string | null;
  rating?: string | number | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  /** Per-day free text, e.g. `{ monday: "8:00 AM - 10:00 PM" }` — no structured time-range shape enforced. */
  openingHours?: Record<string, string> | null;
  averagePrepTime?: number | null;
  minimumOrder?: string | number | null;
  storeStatus: StoreStatus;
  isOpen: boolean;
  verificationStatus: VerificationStatus;
  verificationDocs?: VerificationDocs | null;
  createdAt?: string;
  updatedAt?: string;
}

/** POST /api/restaurants — the store's core identity; everything else is filled in later via updateStoreProfile. */
export interface CreateStorePayload {
  ownerId: string;
  name: string;
  address: string;
  phone?: string;
  cuisine?: string;
  imageUrl?: string;
}

/** PUT /api/restaurants/:id/profile — every field optional, sent as a partial patch. */
export interface UpdateStoreProfilePayload {
  id: string;
  patch: Partial<{
    name: string;
    businessType: BusinessType;
    businessCategory: string;
    ownerName: string;
    address: string;
    landmark: string;
    state: string;
    city: string;
    additionalDirections: string;
    phone: string;
    email: string;
    cuisine: string;
    logoUrl: string;
    coverImageUrl: string;
    description: string;
    openingHours: Record<string, string>;
    averagePrepTime: number;
    minimumOrder: number;
    storeStatus: StoreStatus;
    verificationDocs: VerificationDocs;
  }>;
}

/* ── Menu management ──────────────────────────────────────────────
 * Mirrors the `categories`/`productVariants`/`productExtras` tables —
 * see services/restaurant-service/src/routes/vendor.ts.
 */
export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  menuItemId: string;
  name: string;
  price: string | number;
  available: boolean;
  createdAt?: string;
}

export interface ProductExtra {
  id: string;
  menuItemId: string;
  name: string;
  price: string | number;
  isRequired: boolean;
  available: boolean;
  createdAt?: string;
}

export interface CreateCategoryPayload {
  restaurantId: string;
  name: string;
  displayOrder?: number;
}

/** POST /api/restaurants/:id/menu — same resource as features/restaurants/types.ts's MenuItem. */
export interface CreateMenuItemPayload {
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export interface CreateVariantPayload {
  menuItemId: string;
  name: string;
  price: number;
  available?: boolean;
}

export interface CreateExtraPayload {
  menuItemId: string;
  name: string;
  price: number;
  isRequired?: boolean;
  available?: boolean;
}

/* ── Inventory ──────────────────────────────────────────────────
 * GET/PATCH .../inventory, .../stock — see vendor.ts. The real DB row
 * for a menu item always carries these; features/restaurants/types.ts's
 * `MenuItem` leaves them out since customer browsing doesn't need them.
 */
export type StockStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface VendorMenuItem extends MenuItem {
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  stockStatus: StockStatus;
}

export interface InventorySummary {
  total: number;
  available: number;
  lowStock: number;
  outOfStock: number;
}

export interface UpdateStockPayload {
  menuItemId: string;
  stockQuantity?: number;
  stockStatus?: StockStatus;
  available?: boolean;
}

/* ── Orders (vendor side) ──────────────────────────────────────────
 * order-service's vendorOrders.ts — reuses features/orders/types.ts's
 * `Order` rather than redefining it; this is just the vendor-only
 * dashboard/workflow shapes layered on top of that same resource.
 */
export type VendorOrderTab = "new" | "preparing" | "ready" | "completed" | "cancelled";

export interface VendorDashboardMetrics {
  todayMetrics: {
    totalOrders: number;
    totalRevenue: number;
    pendingCount: number;
    completedCount: number;
  };
  actionRequired: {
    newOrdersCount: number;
    lowStockAlertsCount: number;
    customerMessagesCount: number;
  };
  recentOrders: Order[];
}

/**
 * `restaurantId` on these three travels for cache-invalidation only (same
 * precedent as inventoryApi.ts's UpdateStockPayload note) — vendorOrdersApi
 * strips it before sending the request body.
 */
export interface AcceptOrderPayload {
  id: string;
  restaurantId: string;
  estimatedPrepTime?: number;
}

export interface RejectOrderPayload {
  id: string;
  restaurantId: string;
  rejectionReason: string;
  rejectionNote?: string;
}

/** "ready" and "handover" both take no body — just the id. */
export interface OrderActionPayload {
  id: string;
  restaurantId: string;
}

/* ── Promotions ──────────────────────────────────────────────────
 * restaurant-service's vendor.ts promotions routes — mirrors the
 * `promotions` DB row (services/restaurant-service/src/db/schema.ts).
 */
export type PromotionDiscountType = "discount" | "buy_one_get_one" | "percentage" | "free_item" | "free_delivery";
export type PromotionStatus = "active" | "scheduled" | "expired";

export interface Promotion {
  id: string;
  restaurantId: string;
  name: string;
  discountType: PromotionDiscountType;
  discountAmount: string | number;
  /** Menu item ids this promo applies to; unset/empty means store-wide. */
  eligibleProductIds?: string[] | null;
  startDate: string;
  endDate: string;
  minOrderAmount?: string | number | null;
  maxRedemptions?: number | null;
  /** Always "active" on create — the backend doesn't let a vendor set this, it's read-only here. */
  status: PromotionStatus;
  createdAt?: string;
}

export interface CreatePromotionPayload {
  restaurantId: string;
  name: string;
  discountType: PromotionDiscountType;
  discountAmount: number;
  eligibleProductIds?: string[];
  startDate: string;
  endDate: string;
  minOrderAmount?: number;
  maxRedemptions?: number;
}

/* ── Reviews ─────────────────────────────────────────────────────
 * restaurant-service vendor.ts reviews routes — mirrors the `reviews`
 * DB row (services/restaurant-service/src/db/schema.ts).
 */
export interface Review {
  id: string;
  restaurantId: string;
  customerId: string;
  orderId: string;
  ratingOverall: string | number;
  ratingFood?: string | number | null;
  ratingPackaging?: string | number | null;
  ratingPrep?: string | number | null;
  comment?: string | null;
  vendorReply?: string | null;
  createdAt?: string;
}

export interface ReviewsSummary {
  overallRating: string | number;
  totalReviews: number;
  reviews: Review[];
}

/* ── Earnings & Settlements ─────────────────────────────────────────
 * restaurant-service vendor.ts earnings/settlements routes. Only
 * `totalNetEarnings` is a real backend aggregate (sum of settlement
 * rows) — todayEarnings/thisWeekEarnings/thisMonthEarnings are hardcoded
 * placeholders on the real backend today, not computed; the UI must say
 * so, not hide it.
 */
export interface EarningsSummary {
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalNetEarnings: number;
  settlementsCount: number;
}

export type SettlementStatus = "pending" | "paid";

export interface Settlement {
  id: string;
  restaurantId: string;
  reference: string;
  grossAmount: string | number;
  platformCommission: string | number;
  otherCharges?: string | number | null;
  netEarnings: string | number;
  payoutDate?: string;
  status: SettlementStatus;
  createdAt?: string;
}

/* ── Staff ────────────────────────────────────────────────────────
 * user-service staff.ts (GET/DELETE `/api/users/vendor-staff/...`).
 * There's no email-lookup/invite endpoint anywhere on the backend —
 * `POST .../vendor-staff` requires an existing raw userId with no way to
 * resolve one from an email, so this portal only supports listing and
 * removing staff for now, not adding them.
 */
export interface StaffMember {
  id: string;
  restaurantId: string;
  userId: string;
  role: string;
  name: string;
  email: string;
}
