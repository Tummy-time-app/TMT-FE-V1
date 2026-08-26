import type { MenuItem, Restaurant } from "@/features/restaurants/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * FRONTEND-ONLY PLACEHOLDER DATA — never sent to, or confused with, a
 * real backend response.
 *
 * Shown only when a real query for restaurants genuinely succeeds with
 * zero results (features/restaurants — see the gating logic in each
 * consuming component: `isSuccess && data.length === 0`, never on
 * loading or error) — so a brand-new deployment with no vendors onboarded
 * yet still demonstrates what the page looks like, instead of a bare
 * "nothing here." Every id is prefixed "dummy-" (see lib/dummy/
 * isDummyId.ts) and every card rendering one of these gets a visible
 * DummyStrip (components/ui/DummyStrip.tsx) — this is never presented as
 * real. Names are deliberately generic ("Sample Kitchen") rather than
 * plausible-sounding, reinforcing that on top of the visual marker.
 * ═══════════════════════════════════════════════════════════════════════
 */

export const DUMMY_RESTAURANTS: Restaurant[] = [
  {
    id: "dummy-restaurant-1",
    ownerId: "dummy-owner-1",
    name: "Sample Kitchen",
    address: "Example Street, Your City",
    lat: 6.5244,
    lng: 3.3792,
    cuisine: "Nigerian · Local",
    rating: "4.7",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: "dummy-restaurant-2",
    ownerId: "dummy-owner-2",
    name: "Demo Diner",
    address: "Example Avenue, Your City",
    lat: 6.5833,
    lng: 3.3667,
    cuisine: "Pizza",
    rating: "4.5",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: "dummy-restaurant-3",
    ownerId: "dummy-owner-3",
    name: "Placeholder Grill",
    address: "Example Road, Your City",
    lat: 6.4698,
    lng: 3.5852,
    cuisine: "Burgers",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
];

/** Generic dummy menu — dummyMenuItemsFor() below stamps in the real restaurantId, so it can back either a dummy restaurant or fill a real one that just hasn't added a menu yet. */
const DUMMY_MENU_TEMPLATE: Omit<MenuItem, "restaurantId">[] = [
  {
    id: "dummy-item-1",
    name: "Sample Dish",
    description: "A placeholder menu item — not something you can actually order.",
    price: "12.99",
    category: "Mains",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    id: "dummy-item-2",
    name: "Example Side",
    description: "Another placeholder — this restaurant hasn't published a real menu yet.",
    price: "6.50",
    category: "Sides",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    id: "dummy-item-3",
    name: "Demo Drink",
    description: "Placeholder only.",
    price: "3.99",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
];

export function dummyMenuItemsFor(restaurantId: string): MenuItem[] {
  return DUMMY_MENU_TEMPLATE.map((item) => ({ ...item, restaurantId }));
}
