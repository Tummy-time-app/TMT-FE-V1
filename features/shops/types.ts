/**
 * Net-new — see the redesign plan's Phase 5. TMT-BE-V1 has no shop/
 * product concept at all (its schema only covers restaurants/menu items,
 * see features/restaurants/types.ts's doc comment); this type is modeled
 * on that same shape rather than invented from scratch, so a backend
 * that eventually adds retail support has a contract to build toward,
 * same as features/restaurants/types.ts's own storefront-field pattern.
 */
export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  /** e.g. "Supermarket", "Pharmacy", "Convenience store" — the shop equivalent of a restaurant's cuisine. */
  category?: string | null;
  rating?: string | number | null;
  imageUrl?: string | null;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;

  /** Storefront display fields — no backend field for any of these yet; lib/storefront/displayMeta.ts fills a deterministic placeholder when absent, same contract as Restaurant's. */
  coverImageUrl?: string | null;
  reviewCount?: number | null;
  deliveryFeeNaira?: number | null;
  deliveryEtaMinutes?: number | null;
  minimumOrderNaira?: number | null;
  tags?: string[] | null;
  isNew?: boolean | null;
  promoLabel?: string | null;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  price: string | number;
  category?: string;
  imageUrl?: string | null;
  available: boolean;
  /** e.g. "500g", "1L", "pack of 6" — retail products are sold by unit/size, unlike a restaurant MenuItem. */
  unit?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
