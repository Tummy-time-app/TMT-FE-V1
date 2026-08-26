import { mockDelay } from "@/lib/dev/devMode";
import type { Product, Shop } from "@/features/shops/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Same seed-data pattern as lib/mocks/restaurants.mock.ts, for the net-new
 * Shops surface (see features/shops/types.ts's doc comment — there's no
 * real backend concept of a shop to mirror yet, so this is original seed
 * data rather than a byte-for-byte port of anything).
 * ═══════════════════════════════════════════════════════════════════════
 */

const SHOP_1_ID = "a1b2c3d4-1111-4a1a-8a1a-000000000001";
const SHOP_2_ID = "a1b2c3d4-2222-4a2a-8a2a-000000000002";
const SHOP_3_ID = "a1b2c3d4-3333-4a3a-8a3a-000000000003";
const SHOP_4_ID = "a1b2c3d4-4444-4a4a-8a4a-000000000004";

const shops: Shop[] = [
  {
    id: SHOP_1_ID,
    ownerId: "b2c3d4e5-1111-4b1b-9b1b-100000000001",
    name: "QuickMart Express",
    address: "18 Adeola Odeku Street, Victoria Island",
    lat: 6.4281,
    lng: 3.4219,
    phone: "+234 802 555 0101",
    category: "Supermarket",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1601599963565-b7f49deb2c93?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: SHOP_2_ID,
    ownerId: "b2c3d4e5-2222-4b2b-9b2b-100000000002",
    name: "GreenLeaf Pharmacy",
    address: "5 Allen Avenue, Ikeja",
    lat: 6.6018,
    lng: 3.3515,
    phone: "+234 802 555 0102",
    category: "Pharmacy",
    rating: "4.8",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: SHOP_3_ID,
    ownerId: "b2c3d4e5-3333-4b3b-9b3b-100000000003",
    name: "Daily Essentials Store",
    address: "62 Herbert Macaulay Way, Yaba",
    lat: 6.5104,
    lng: 3.3792,
    phone: "+234 802 555 0103",
    category: "Convenience store",
    rating: "4.3",
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: SHOP_4_ID,
    ownerId: "b2c3d4e5-4444-4b4b-9b4b-100000000004",
    name: "FreshCuts Butchery",
    address: "23 Bode Thomas Street, Surulere",
    lat: 6.4924,
    lng: 3.3592,
    phone: "+234 802 555 0104",
    category: "Butchery",
    rating: "4.5",
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
    isOpen: false,
  },
];

const productsByShop: Record<string, Product[]> = {
  [SHOP_1_ID]: [
    { id: "p101", shopId: SHOP_1_ID, name: "Rice (Long Grain)", price: "6500", unit: "5kg", category: "Grains", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p102", shopId: SHOP_1_ID, name: "Vegetable Oil", price: "4200", unit: "1L", category: "Cooking", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p103", shopId: SHOP_1_ID, name: "Full Cream Milk Powder", price: "3800", unit: "400g", category: "Dairy", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p104", shopId: SHOP_1_ID, name: "Laundry Detergent", price: "2100", unit: "1kg", category: "Household", imageUrl: "https://images.unsplash.com/photo-1610557892470-55d587fed822?auto=format&fit=crop&w=400&q=80", available: false },
  ],
  [SHOP_2_ID]: [
    { id: "p201", shopId: SHOP_2_ID, name: "Paracetamol Tablets", price: "800", unit: "20 tabs", category: "Medicine", imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p202", shopId: SHOP_2_ID, name: "Vitamin C Chewables", price: "2500", unit: "60 tabs", category: "Vitamins", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p203", shopId: SHOP_2_ID, name: "First Aid Kit", price: "5500", unit: "1 set", category: "First aid", imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80", available: true },
  ],
  [SHOP_3_ID]: [
    { id: "p301", shopId: SHOP_3_ID, name: "Bottled Water (Pack)", price: "1200", unit: "12 x 50cl", category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p302", shopId: SHOP_3_ID, name: "Instant Noodles (Carton)", price: "3200", unit: "40 packs", category: "Pantry", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p303", shopId: SHOP_3_ID, name: "Toilet Tissue", price: "2800", unit: "12 rolls", category: "Household", imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=400&q=80", available: true },
  ],
  [SHOP_4_ID]: [
    { id: "p401", shopId: SHOP_4_ID, name: "Beef Cuts", price: "7500", unit: "1kg", category: "Beef", imageUrl: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=400&q=80", available: true },
    { id: "p402", shopId: SHOP_4_ID, name: "Chicken (Whole)", price: "6200", unit: "1.5kg", category: "Poultry", imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80", available: true },
  ],
};

export async function mockListShops(): Promise<Shop[]> {
  await mockDelay();
  return shops;
}

export async function mockGetShop(id: string): Promise<Shop> {
  await mockDelay();
  const shop = shops.find((s) => s.id === id);
  if (!shop) throw { status: 404, message: "Shop not found" };
  return shop;
}

export async function mockGetProducts(shopId: string): Promise<Product[]> {
  await mockDelay();
  return productsByShop[shopId] ?? [];
}
