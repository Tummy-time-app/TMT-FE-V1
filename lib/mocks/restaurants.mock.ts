import { mockDelay } from "@/lib/dev/devMode";
import type { MenuItem, Restaurant } from "@/features/restaurants/types";
import { getVendorMenuItemsForRestaurant } from "./vendorMenu.mock";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors restaurant-service's own hardcoded seed data byte-for-byte (see
 * services/restaurant-service/src/routes/restaurants.ts's
 * initialMockRestaurants/initialMockMenuItems) so dev mode looks identical
 * to what hitting the real backend shows before you paste NEXT_PUBLIC_API_URL.
 * Only lib/dev/devMode.ts-gated branches inside restaurantsApi.ts import
 * from here.
 * ═══════════════════════════════════════════════════════════════════════
 */

const RST_1_ID = "c6b8d4e9-11f2-4a8a-9310-84a1e9481a01";
const RST_2_ID = "d7c9e5f0-22a3-4b9b-8421-95b2fa592b02";
const RST_3_ID = "e8da0f1a-33b4-4cac-9532-a6c3ab603c03";
const RST_4_ID = "f9eb1a2b-44c5-4dbd-a643-b7d4bc714d04";

const restaurants: Restaurant[] = [
  {
    id: RST_1_ID,
    ownerId: "a29b3c4d-5e6f-4a1b-8c9d-0e1f2a3b4c5d",
    name: "Burger Crafters",
    address: "124 Culinary Way, Downtown",
    phone: "+1 555-0192",
    cuisine: "Burgers",
    rating: "4.8",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: RST_2_ID,
    ownerId: "b30c4d5e-6f7a-5b2c-9d0e-1f2a3b4c5d6e",
    name: "Pizza Napoli",
    address: "42 Little Italy Ave",
    phone: "+1 555-0188",
    cuisine: "Pizza",
    rating: "4.9",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: RST_3_ID,
    ownerId: "c41d5e6f-7a8b-6c3d-0e1f-2a3b4c5d6e7f",
    name: "Sakura Sushi Bar",
    address: "88 Sakura Boulevard",
    phone: "+1 555-0144",
    cuisine: "Asian",
    rating: "4.7",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: RST_4_ID,
    ownerId: "d52e6f7a-8b9c-7d4e-1f2a-3b4c5d6e7f8a",
    name: "Green Garden Bowls",
    address: "15 Organic Street",
    phone: "+1 555-0177",
    cuisine: "Healthy",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
];

const menuItemsByRestaurant: Record<string, MenuItem[]> = {
  [RST_1_ID]: [
    {
      id: "b101a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_1_ID,
      name: "TMT Double Smash Burger",
      description: "Two prime beef patties, sharp cheddar, caramelized onions & house special sauce on brioche",
      price: "14.99",
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
    {
      id: "b102a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_1_ID,
      name: "Truffle Parmesan Fries",
      description: "Hand-cut crispy fries tossed with white truffle oil, sea salt & grated parmigiano",
      price: "6.50",
      category: "Sides",
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
    {
      id: "b103a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_1_ID,
      name: "Craft Vanilla Milkshake",
      description: "Rich Madagascar vanilla bean ice cream blended with whole milk and topped with whip",
      price: "5.99",
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_2_ID]: [
    {
      id: "b201a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_2_ID,
      name: "Neapolitan Margherita",
      description: "San Marzano tomato sauce, fresh mozzarella di bufala, basil leaves & extra virgin olive oil",
      price: "18.50",
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
    {
      id: "b202a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_2_ID,
      name: "Spicy Diavola",
      description: "Fiery Calabrian salami, chili flakes, roasted red peppers & mozzarella",
      price: "20.00",
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_3_ID]: [
    {
      id: "b301a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_3_ID,
      name: "Dragon Roll Deluxe",
      description: "Unagi, cucumber wrapped with avocado, topped with tobiko & unagi reduction",
      price: "16.99",
      category: "Asian",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_4_ID]: [
    {
      id: "b401a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_4_ID,
      name: "Avocado Quinoa Power Bowl",
      description: "Organic quinoa, sliced avocado, edamame, roasted sweet potatoes & tahini dressing",
      price: "13.99",
      category: "Healthy",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
};

export async function mockListRestaurants(): Promise<Restaurant[]> {
  await mockDelay();
  return restaurants;
}

export async function mockGetRestaurant(id: string): Promise<Restaurant> {
  await mockDelay();
  const restaurant = restaurants.find((r) => r.id === id);
  if (!restaurant) throw { status: 404, message: "Restaurant not found" };
  return restaurant;
}

export async function mockGetMenu(restaurantId: string): Promise<MenuItem[]> {
  await mockDelay();
  // Merge in items a vendor added via the vendor portal (lib/mocks/
  // vendorMenu.mock.ts) — so a customer browsing that store in mock mode
  // actually sees them, not just the vendor's own view.
  return [...(menuItemsByRestaurant[restaurantId] ?? []), ...getVendorMenuItemsForRestaurant(restaurantId)];
}
