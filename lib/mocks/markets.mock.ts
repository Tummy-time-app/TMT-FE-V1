import { mockDelay } from "@/lib/dev/devMode";
import type { Market } from "@/features/markets/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Same seed-data pattern as lib/mocks/restaurants.mock.ts / shops.mock.ts,
 * for the net-new Markets surface (see features/markets/types.ts's doc
 * comment).
 * ═══════════════════════════════════════════════════════════════════════
 */

const MARKET_1_ID = "c3d4e5f6-1111-4c1c-8c1c-000000000001";
const MARKET_2_ID = "c3d4e5f6-2222-4c2c-8c2c-000000000002";
const MARKET_3_ID = "c3d4e5f6-3333-4c3c-8c3c-000000000003";

const markets: Market[] = [
  {
    id: MARKET_1_ID,
    name: "Mile 12 Fresh Market",
    address: "Mile 12, Kosofe, Lagos",
    lat: 6.5928,
    lng: 3.3958,
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    rating: "4.5",
    reviewCount: 412,
    vendorCount: 6,
    categories: ["Vegetables", "Fruits", "Grains", "Spices"],
    vendors: [
      { id: "v101", name: "Mama Ngozi's Vegetables", categories: ["Vegetables", "Herbs"], imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80" },
      { id: "v102", name: "Alhaji Musa Grains", categories: ["Grains", "Beans"], imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80" },
      { id: "v103", name: "Tropical Fruit Corner", categories: ["Fruits"], imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80" },
      { id: "v104", name: "Spice Route Stall", categories: ["Spices", "Seasoning"], imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80" },
    ],
  },
  {
    id: MARKET_2_ID,
    name: "Balogun Textile & Goods Market",
    address: "Balogun Street, Lagos Island",
    lat: 6.4541,
    lng: 3.3947,
    imageUrl: "https://images.unsplash.com/photo-1555529771-122e5d9f2341?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    rating: "4.2",
    reviewCount: 198,
    vendorCount: 4,
    categories: ["Fabrics", "Household goods", "Accessories"],
    vendors: [
      { id: "v201", name: "Adire House", categories: ["Fabrics"], imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80" },
      { id: "v202", name: "Balogun Home Essentials", categories: ["Household goods"], imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80" },
      { id: "v203", name: "Beads & Accessories Stall", categories: ["Accessories"], imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80" },
    ],
  },
  {
    id: MARKET_3_ID,
    name: "Ikeja City Farmers Market",
    address: "Oba Akran Avenue, Ikeja",
    lat: 6.6059,
    lng: 3.3491,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    isOpen: false,
    rating: "4.7",
    reviewCount: 87,
    vendorCount: 3,
    categories: ["Organic produce", "Dairy", "Bakery"],
    vendors: [
      { id: "v301", name: "Green Acres Organic", categories: ["Organic produce"], imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=400&q=80" },
      { id: "v302", name: "Sunrise Dairy Stand", categories: ["Dairy"], imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80" },
      { id: "v303", name: "Artisan Bakery Corner", categories: ["Bakery"], imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80" },
    ],
  },
];

export async function mockListMarkets(): Promise<Market[]> {
  await mockDelay();
  return markets;
}

export async function mockGetMarket(id: string): Promise<Market> {
  await mockDelay();
  const market = markets.find((m) => m.id === id);
  if (!market) throw { status: 404, message: "Market not found" };
  return market;
}
