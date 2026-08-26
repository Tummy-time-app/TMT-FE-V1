import type { Product, Shop } from "@/features/shops/types";

/**
 * FRONTEND-ONLY PLACEHOLDER DATA — see lib/dummy/restaurants.dummy.ts's
 * doc comment for the full rationale; same rules apply here.
 */

export const DUMMY_SHOPS: Shop[] = [
  {
    id: "dummy-shop-1",
    ownerId: "dummy-owner-1",
    name: "Sample Mart",
    address: "Example Street, Your City",
    lat: 6.4281,
    lng: 3.4219,
    category: "Supermarket",
    rating: "4.4",
    imageUrl: "https://images.unsplash.com/photo-1601599963565-b7f49deb2c93?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
  {
    id: "dummy-shop-2",
    ownerId: "dummy-owner-2",
    name: "Demo Pharmacy",
    address: "Example Avenue, Your City",
    lat: 6.6018,
    lng: 3.3515,
    category: "Pharmacy",
    rating: "4.6",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    isOpen: true,
  },
];

const DUMMY_PRODUCT_TEMPLATE: Omit<Product, "shopId">[] = [
  {
    id: "dummy-product-1",
    name: "Sample Product",
    price: "2500",
    unit: "1 unit",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    id: "dummy-product-2",
    name: "Example Item",
    price: "1800",
    unit: "1 unit",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
];

export function dummyProductsFor(shopId: string): Product[] {
  return DUMMY_PRODUCT_TEMPLATE.map((product) => ({ ...product, shopId }));
}
