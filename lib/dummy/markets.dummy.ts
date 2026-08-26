import type { Market } from "@/features/markets/types";

/**
 * FRONTEND-ONLY PLACEHOLDER DATA — see lib/dummy/restaurants.dummy.ts's
 * doc comment for the full rationale; same rules apply here. Markets
 * carry their vendor list inline (features/markets/types.ts), so unlike
 * restaurants/shops there's no separate dummyVendorsFor() helper needed.
 */

export const DUMMY_MARKETS: Market[] = [
  {
    id: "dummy-market-1",
    name: "Sample Market",
    address: "Example District, Your City",
    lat: 6.5928,
    lng: 3.3958,
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    rating: "4.5",
    reviewCount: 0,
    vendorCount: 2,
    categories: ["Vegetables", "Grains"],
    vendors: [
      {
        id: "dummy-vendor-1",
        name: "Sample Produce Stall",
        categories: ["Vegetables"],
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "dummy-vendor-2",
        name: "Demo Grains Stall",
        categories: ["Grains"],
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];
