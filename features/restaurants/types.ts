/**
 * Mirrors TMT-BE-V1's restaurant-service exactly — see
 * services/restaurant-service/src/db/schema.ts and
 * shared/src/types.ts's RestaurantDTO/MenuItemDTO (the backend's own
 * declared public contract). The DB row has many more vendor-management
 * columns (verificationStatus, openingHours, averagePrepTime, ...) — not
 * modeled here since there's no vendor dashboard UI to use them yet.
 */
export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  /** Not in the backend doc's restaurant-service schema yet — added frontend-side for the map feature (components/maps/); absent means "no map to show." */
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  cuisine?: string | null;
  rating?: string | number | null;
  imageUrl?: string | null;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;

  /**
   * ── Storefront display fields ──────────────────────────────────────
   * None of these are in the backend doc's restaurant-service schema yet.
   * They document the contract a real storefront needs — this is the
   * shape the backend should build toward — and every one is optional:
   * when absent, lib/storefront/displayMeta.ts fills a deterministic
   * placeholder (seeded by `id`, so it's stable, not random-per-render)
   * rather than the UI showing a gap. Once the backend sends a real value
   * for a field, that value wins automatically — nothing to rip out here.
   */
  /** Wide banner image for the detail page hero — falls back to `imageUrl` when unset. */
  coverImageUrl?: string | null;
  reviewCount?: number | null;
  /** Naira; 0 means free delivery. */
  deliveryFeeNaira?: number | null;
  /** Estimated minutes door-to-door (midpoint — the UI renders it as a small range around this). */
  deliveryEtaMinutes?: number | null;
  minimumOrderNaira?: number | null;
  /** 1=₦, 2=₦₦, 3=₦₦₦. */
  priceRange?: 1 | 2 | 3 | null;
  tags?: string[] | null;
  isNew?: boolean | null;
  /** Short promo chip, e.g. "20% off", "Free delivery". */
  promoLabel?: string | null;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: string | number;
  category?: string;
  imageUrl?: string | null;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;

  /** Storefront display fields — same deal as Restaurant's above, filled by lib/storefront/displayMeta.ts when absent. */
  isPopular?: boolean | null;
  isSpicy?: boolean | null;
  isVegetarian?: boolean | null;
}
