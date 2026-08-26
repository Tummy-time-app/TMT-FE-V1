/**
 * Net-new — see the redesign plan's Phase 5. A market is a multi-vendor
 * bazaar, not a single storefront (that's Shop/Product — features/shops/
 * types.ts) — so instead of a product catalog, a market's detail page
 * browses its vendor list, each carrying the product categories they
 * sell there. No backend concept of this exists in TMT-BE-V1 at all.
 */
export interface MarketVendor {
  id: string;
  name: string;
  categories: string[];
  imageUrl?: string | null;
}

export interface Market {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  imageUrl?: string | null;
  isOpen: boolean;
  rating?: string | number | null;
  reviewCount?: number | null;
  vendorCount?: number | null;
  /** Aggregate product categories available across the market's vendors — the market-level equivalent of a restaurant's cuisine tag. */
  categories?: string[] | null;
  vendors?: MarketVendor[];

  /** Storefront display fields — same deterministic-placeholder contract as Restaurant/Shop, see lib/storefront/displayMeta.ts. */
  deliveryFeeNaira?: number | null;
  deliveryEtaMinutes?: number | null;
  minimumOrderNaira?: number | null;
  promoLabel?: string | null;
}
