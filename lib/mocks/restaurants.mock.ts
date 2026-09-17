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
const RST_5_ID = "0a1c2b3d-55d6-4ece-a754-c8e5cd825e15";
const RST_6_ID = "1b2d3c4e-66e7-4fdf-b865-d9f6de936f26";
const RST_7_ID = "2c3e4d5f-77f8-40e0-c976-e0a7ea047a37";
const RST_8_ID = "3d4f5e60-8809-41f1-da87-f1b8fb158b48";

/** For the Admin dashboard's Vendors list mock (lib/mocks/adminVendors.mock.ts) — the base seed list, before any admin overrides. */
export const BASE_RESTAURANTS: Restaurant[] = [
  {
    id: RST_1_ID,
    ownerId: "a29b3c4d-5e6f-4a1b-8c9d-0e1f2a3b4c5d",
    name: "Burger Crafters",
    address: "124 Culinary Way, Downtown",
    lat: 6.4531,
    lng: 3.3958,
    phone: "+1 555-0192",
    cuisine: "Burgers",
    rating: "4.8",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "restaurant",
  },
  {
    id: RST_2_ID,
    ownerId: "b30c4d5e-6f7a-5b2c-9d0e-1f2a3b4c5d6e",
    name: "Pizza Napoli",
    address: "42 Little Italy Ave",
    lat: 6.5833,
    lng: 3.3667,
    phone: "+1 555-0188",
    cuisine: "Pizza",
    rating: "4.9",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "restaurant",
  },
  {
    id: RST_3_ID,
    ownerId: "c41d5e6f-7a8b-6c3d-0e1f-2a3b4c5d6e7f",
    name: "Sakura Sushi Bar",
    address: "88 Sakura Boulevard",
    lat: 6.4698,
    lng: 3.5852,
    phone: "+1 555-0144",
    cuisine: "Asian",
    rating: "4.7",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "restaurant",
  },
  {
    id: RST_4_ID,
    ownerId: "d52e6f7a-8b9c-7d4e-1f2a-3b4c5d6e7f8a",
    name: "Green Garden Bowls",
    address: "15 Organic Street",
    lat: 6.4281,
    lng: 3.4219,
    phone: "+1 555-0177",
    cuisine: "Healthy",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "restaurant",
  },
  {
    id: RST_5_ID,
    ownerId: "e63f7a8b-9c0d-4e5f-2a3b-4c5d6e7f8a9b",
    name: "FreshMart Groceries",
    address: "9 Market Street, Downtown",
    lat: 6.4451,
    lng: 3.4102,
    phone: "+1 555-0211",
    cuisine: "Groceries",
    rating: "4.5",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "grocery",
  },
  {
    id: RST_6_ID,
    ownerId: "f74a8b9c-0d1e-4f60-3b4c-5d6e7f8a9b0c",
    name: "CityCare Pharmacy & Essentials",
    address: "27 High Street",
    lat: 6.5095,
    lng: 3.3789,
    phone: "+1 555-0233",
    cuisine: "Pharmacy",
    rating: "4.7",
    imageUrl: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "retail",
  },
  {
    id: RST_7_ID,
    ownerId: "0851aa25-1e2f-4071-4c5d-6e7f8a9b0c1d",
    name: "Yaba Fish Stall",
    address: "Mile 12 Fresh Market, Stall 14",
    lat: 6.4413,
    lng: 3.3894,
    phone: "+1 555-0255",
    cuisine: "Seafood",
    rating: "4.3",
    imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "market",
    businessCategory: "Mile 12 Fresh Market",
  },
  {
    id: RST_8_ID,
    ownerId: "1962bb36-2f30-4182-5d6e-7f8a9b0c1d2e",
    name: "Amaka's Produce Corner",
    address: "Mile 12 Fresh Market, Stall 22",
    lat: 6.4415,
    lng: 3.3898,
    phone: "+1 555-0266",
    cuisine: "Fruits & Vegetables",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
    businessType: "market",
    businessCategory: "Mile 12 Fresh Market",
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
  [RST_5_ID]: [
    {
      id: "b501a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_5_ID,
      name: "Basmati Rice (5kg)",
      description: "Long-grain aromatic basmati rice",
      price: "12.00",
      category: "Grains",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
    {
      id: "b502a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_5_ID,
      name: "Farm Fresh Eggs (Crate of 30)",
      description: "Free-range eggs, sourced daily",
      price: "8.50",
      category: "Dairy & Eggs",
      imageUrl: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_6_ID]: [
    {
      id: "b601a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_6_ID,
      name: "Paracetamol 500mg (20 tabs)",
      description: "Pain relief tablets",
      price: "2.50",
      category: "Medicine",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
    {
      id: "b602a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_6_ID,
      name: "Hand Sanitizer (500ml)",
      description: "70% alcohol antibacterial gel",
      price: "4.00",
      category: "Personal Care",
      imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_7_ID]: [
    {
      id: "b701a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_7_ID,
      name: "Fresh Catfish (1kg)",
      description: "Live catfish, cleaned on request",
      price: "9.00",
      category: "Seafood",
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
  [RST_8_ID]: [
    {
      id: "b801a2b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      restaurantId: RST_8_ID,
      name: "Ripe Plantain (Bunch)",
      description: "Sweet ripe plantains",
      price: "3.50",
      category: "Fruits & Vegetables",
      imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80",
      available: true,
    },
  ],
};

export async function mockListRestaurants(businessType?: string): Promise<Restaurant[]> {
  await mockDelay();
  if (!businessType) return BASE_RESTAURANTS;
  const types = businessType.split(",").map((t) => t.trim()).filter(Boolean);
  return BASE_RESTAURANTS.filter((r) => r.businessType && types.includes(r.businessType));
}

export async function mockGetRestaurant(id: string): Promise<Restaurant> {
  await mockDelay();
  const restaurant = BASE_RESTAURANTS.find((r) => r.id === id);
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
