import type { MenuItem, Restaurant } from "@/features/restaurants/types";
import type { Shop } from "@/features/shops/types";
import type { Market } from "@/features/markets/types";

/**
 * Deterministic placeholder data for storefront fields the real backend
 * doesn't send yet (delivery fee/ETA, review count, price range, tags,
 * "popular"/"spicy" badges...) — see the doc comments on Restaurant/
 * MenuItem in features/restaurants/types.ts for the contract this fills.
 *
 * Every value here is seeded from the entity's own `id`, not `Math.random()`
 * — the same restaurant always gets the same placeholder numbers across
 * renders and reloads, so it reads as stable content, not a slot machine.
 * It's still fake: nothing here is sent to any mutation, and every getter
 * below prefers a real field first — once the backend populates one, this
 * stops firing for that field on its own.
 */

function hashSeed(id: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic integer in [min, max], drawing from a shifted slice of the seed so nearby calls don't correlate. */
function pick(seed: number, shift: number, min: number, max: number): number {
  const slice = (seed >>> shift) & 0xffff;
  return min + (slice % (max - min + 1));
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export interface RestaurantDisplayMeta {
  coverImageUrl: string | null;
  reviewCount: number;
  deliveryFeeNaira: number;
  deliveryEtaMinutes: number;
  minimumOrderNaira: number;
  priceRange: 1 | 2 | 3;
  tags: string[];
  isNew: boolean;
  promoLabel: string | null;
}

const PROMO_LABELS = ["20% off", "Free delivery", "Buy 1 Get 1"];

/** Splits a "Nigerian · Local" / "Continental, Fast food" style cuisine string into individual tags. */
function tagsFromCuisine(cuisine: string | null | undefined): string[] {
  if (!cuisine) return [];
  return cuisine
    .split(/[·,&/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getRestaurantDisplayMeta(restaurant: Restaurant): RestaurantDisplayMeta {
  const seed = hashSeed(restaurant.id);

  const derivedTags = tagsFromCuisine(restaurant.cuisine);
  const promoRoll = pick(seed, 0, 0, 99);

  return {
    coverImageUrl: restaurant.coverImageUrl ?? restaurant.imageUrl ?? null,
    reviewCount: restaurant.reviewCount ?? pick(seed, 4, 15, 320),
    deliveryFeeNaira: restaurant.deliveryFeeNaira ?? (pick(seed, 8, 0, 4) === 0 ? 0 : roundTo(pick(seed, 12, 100, 500), 50)),
    deliveryEtaMinutes: restaurant.deliveryEtaMinutes ?? pick(seed, 16, 15, 45),
    minimumOrderNaira: restaurant.minimumOrderNaira ?? roundTo(pick(seed, 20, 800, 2500), 100),
    priceRange: (restaurant.priceRange ?? (((pick(seed, 24, 0, 999)) % 3) + 1)) as 1 | 2 | 3,
    tags: restaurant.tags ?? (derivedTags.length > 0 ? derivedTags : ["Popular"]),
    isNew: restaurant.isNew ?? pick(seed, 28, 0, 8) === 0,
    promoLabel:
      restaurant.promoLabel !== undefined
        ? restaurant.promoLabel
        : promoRoll < 30
          ? PROMO_LABELS[promoRoll % PROMO_LABELS.length]
          : null,
  };
}

export interface ShopDisplayMeta {
  coverImageUrl: string | null;
  reviewCount: number;
  deliveryFeeNaira: number;
  deliveryEtaMinutes: number;
  minimumOrderNaira: number;
  tags: string[];
  isNew: boolean;
  promoLabel: string | null;
}

/** Same placeholder contract as getRestaurantDisplayMeta — a shop's `category` stands in for a restaurant's `cuisine`. */
export function getShopDisplayMeta(shop: Shop): ShopDisplayMeta {
  const seed = hashSeed(shop.id);
  const promoRoll = pick(seed, 0, 0, 99);

  return {
    coverImageUrl: shop.coverImageUrl ?? shop.imageUrl ?? null,
    reviewCount: shop.reviewCount ?? pick(seed, 4, 10, 260),
    deliveryFeeNaira: shop.deliveryFeeNaira ?? (pick(seed, 8, 0, 4) === 0 ? 0 : roundTo(pick(seed, 12, 100, 500), 50)),
    deliveryEtaMinutes: shop.deliveryEtaMinutes ?? pick(seed, 16, 20, 60),
    minimumOrderNaira: shop.minimumOrderNaira ?? roundTo(pick(seed, 20, 1000, 3000), 100),
    tags: shop.tags ?? (shop.category ? [shop.category] : ["Retail"]),
    isNew: shop.isNew ?? pick(seed, 28, 0, 8) === 0,
    promoLabel:
      shop.promoLabel !== undefined ? shop.promoLabel : promoRoll < 25 ? PROMO_LABELS[promoRoll % PROMO_LABELS.length] : null,
  };
}

export interface MarketDisplayMeta {
  reviewCount: number;
  deliveryFeeNaira: number;
  deliveryEtaMinutes: number;
  minimumOrderNaira: number;
  promoLabel: string | null;
}

/** Same placeholder contract again, pared down to what Market actually needs (no priceRange/tags — a market's own `categories` field already covers that). */
export function getMarketDisplayMeta(market: Market): MarketDisplayMeta {
  const seed = hashSeed(market.id);
  const promoRoll = pick(seed, 0, 0, 99);

  return {
    reviewCount: market.reviewCount ?? pick(seed, 4, 30, 450),
    deliveryFeeNaira: market.deliveryFeeNaira ?? (pick(seed, 8, 0, 5) === 0 ? 0 : roundTo(pick(seed, 12, 150, 600), 50)),
    deliveryEtaMinutes: market.deliveryEtaMinutes ?? pick(seed, 16, 30, 75),
    minimumOrderNaira: market.minimumOrderNaira ?? roundTo(pick(seed, 20, 1500, 4000), 100),
    promoLabel:
      market.promoLabel !== undefined
        ? market.promoLabel
        : promoRoll < 20
          ? PROMO_LABELS[promoRoll % PROMO_LABELS.length]
          : null,
  };
}

export interface MenuItemDisplayMeta {
  isPopular: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
}

export function getMenuItemDisplayMeta(item: MenuItem): MenuItemDisplayMeta {
  const seed = hashSeed(item.id);
  return {
    isPopular: item.isPopular ?? pick(seed, 0, 0, 4) === 0,
    isSpicy: item.isSpicy ?? pick(seed, 6, 0, 6) === 0,
    isVegetarian: item.isVegetarian ?? pick(seed, 10, 0, 5) === 0,
  };
}
