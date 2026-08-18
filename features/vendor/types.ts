/**
 * The vendor's own view of their store — mirrors TMT-BE-V1's full
 * `restaurants` DB row (services/restaurant-service/src/db/schema.ts),
 * much richer than features/restaurants/types.ts's `Restaurant` (the
 * thin, read-only shape customer-facing browsing uses).
 */
export type BusinessType = "restaurant" | "grocery" | "retail" | "other";
export type StoreStatus = "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

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
  averagePrepTime?: number | null;
  minimumOrder?: string | number | null;
  storeStatus: StoreStatus;
  isOpen: boolean;
  verificationStatus: VerificationStatus;
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
    averagePrepTime: number;
    minimumOrder: number;
    storeStatus: StoreStatus;
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
