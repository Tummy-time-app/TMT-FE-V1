// types/vendor.ts  — or paste inline above your component

import {
  UtensilsCrossed,
  Pizza,
  CupSoda,
  Soup,
  RiceBowl,
  Flame,
  Burger,
  Dessert,
  Baguette,
  Milk,
  Pharmacy,
  Broom,
  Popcorn,
  Fish,
  Wheat,
  Seasoning,
  AppleFruit,
  type IconComponent,
} from "@/components/icons";
import type { VendorBusinessType } from "@/features/vendors/types";

export type Vendor = {
  id: string;
  name: string;
  image: string;          // path under /public/images/vendors/
  cuisine: string;
  category: string;       // matches Category.id, scoped to this vendor's businessType category list
  rating: number;
  reviewCount: number;
  deliveryTime: string;   // e.g. "25-35"
  deliveryFee: number;    // 0 = free
  minOrder: number;
  priceRange: 1 | 2 | 3; // $ $$ $$$
  isOpen: boolean;
  isNew: boolean;
  isFeatured: boolean;
  promoLabel?: string;    // e.g. "20% off"
  location: { lat: number; lng: number }; // seed coords around Lagos Ikoyi/VI, for the maps feature
  approvalStatus: "pending" | "approved" | "suspended"; // default state — lib/mocks/vendors.mock.ts overlays admin changes
  businessType?: VendorBusinessType; // defaults to "restaurant" when unset (see lib/mocks/vendors.mock.ts)
};

export type Category = {
  id: string;
  label: string;
  icon: IconComponent;
  gradient: string;
};

/* ── seed data ─────────────────────────────────────────── */

/** Restaurant cuisine categories. Kept as `CATEGORIES` too — the original export name — since it's the default/most-used list. */
export const RESTAURANT_CATEGORIES: Category[] = [
  { id: "all",      label: "All",        icon: UtensilsCrossed, gradient: "linear-gradient(135deg,#AC0000,#FFB703)" },
  { id: "pizza",    label: "Pizza",      icon: Pizza,           gradient: "linear-gradient(135deg,#AC0000,#e05c00)" },
  { id: "drinks",   label: "Drinks",     icon: CupSoda,         gradient: "linear-gradient(135deg,#c25000,#FFB703)" },
  { id: "soup",     label: "Soups",      icon: Soup,            gradient: "linear-gradient(135deg,#8B0000,#c44b00)" },
  { id: "rice",     label: "Rice",       icon: RiceBowl,        gradient: "linear-gradient(135deg,#AC0000,#b86a00)" },
  { id: "grills",   label: "Grills",     icon: Flame,           gradient: "linear-gradient(135deg,#7a0000,#AC0000)" },
  { id: "burgers",  label: "Burgers",    icon: Burger,          gradient: "linear-gradient(135deg,#b85000,#FFB703)" },
  { id: "desserts", label: "Desserts",   icon: Dessert,         gradient: "linear-gradient(135deg,#c23a00,#e08000)" },
];
export const CATEGORIES = RESTAURANT_CATEGORIES;

/** Shop (convenience/pharmacy/household) categories. */
export const SHOP_CATEGORIES: Category[] = [
  { id: "all",       label: "All",             icon: UtensilsCrossed, gradient: "linear-gradient(135deg,#AC0000,#FFB703)" },
  { id: "pantry",    label: "Pantry & Snacks", icon: Popcorn,         gradient: "linear-gradient(135deg,#AC0000,#e05c00)" },
  { id: "beverages", label: "Beverages",       icon: CupSoda,         gradient: "linear-gradient(135deg,#c25000,#FFB703)" },
  { id: "bakery",    label: "Bakery",          icon: Baguette,        gradient: "linear-gradient(135deg,#8B0000,#c44b00)" },
  { id: "dairy",     label: "Dairy & Eggs",    icon: Milk,            gradient: "linear-gradient(135deg,#AC0000,#b86a00)" },
  { id: "household", label: "Household",       icon: Broom,           gradient: "linear-gradient(135deg,#7a0000,#AC0000)" },
  { id: "wellness",  label: "Wellness",        icon: Pharmacy,        gradient: "linear-gradient(135deg,#b85000,#FFB703)" },
];

/** Local market (fresh produce) categories. */
export const MARKET_CATEGORIES: Category[] = [
  { id: "all",       label: "All",                  icon: UtensilsCrossed, gradient: "linear-gradient(135deg,#AC0000,#FFB703)" },
  { id: "produce",   label: "Fruits & Vegetables",  icon: AppleFruit,      gradient: "linear-gradient(135deg,#AC0000,#e05c00)" },
  { id: "grains",    label: "Grains & Tubers",      icon: Wheat,           gradient: "linear-gradient(135deg,#8B0000,#c44b00)" },
  { id: "proteins",  label: "Proteins & Seafood",   icon: Fish,            gradient: "linear-gradient(135deg,#7a0000,#AC0000)" },
  { id: "spices",    label: "Spices & Condiments",  icon: Seasoning,       gradient: "linear-gradient(135deg,#b85000,#FFB703)" },
  { id: "dairy",     label: "Dairy & Eggs",         icon: Milk,            gradient: "linear-gradient(135deg,#AC0000,#b86a00)" },
  { id: "beverages", label: "Beverages",            icon: CupSoda,         gradient: "linear-gradient(135deg,#c25000,#FFB703)" },
];

export const CATEGORIES_BY_TYPE: Record<VendorBusinessType, Category[]> = {
  restaurant: RESTAURANT_CATEGORIES,
  shop: SHOP_CATEGORIES,
  market: MARKET_CATEGORIES,
};

export const VENDORS: Vendor[] = [
  // Handpicked / featured
  {
    id: "mr-toms-spag-grills", name: "Mr Toms Spag & Grills", image: "/images/jollof-spaghetti.jpg",
    cuisine: "Italian · Grills", category: "grills",
    rating: 5.0, reviewCount: 142, deliveryTime: "31-40",
    deliveryFee: 0, minOrder: 1500, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: true, promoLabel: "Free delivery",
    location: { lat: 6.451, lng: 3.421 }, approvalStatus: "approved",
  },
  {
    id: "amarachi-food", name: "Amarachi Food", image: "/images/jollof__jolloffestival__yummy-removebg-preview.png",
    cuisine: "Nigerian · Local", category: "rice",
    rating: 4.7, reviewCount: 89, deliveryTime: "31-40",
    deliveryFee: 200, minOrder: 1000, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: true,
    location: { lat: 6.438, lng: 3.401 }, approvalStatus: "approved",
  },
  {
    id: "foodie", name: "Foodie.com", image: "/images/friedrice.png",
    cuisine: "Continental · Fast food", category: "burgers",
    rating: 3.5, reviewCount: 34, deliveryTime: "31-40",
    deliveryFee: 300, minOrder: 800, priceRange: 2,
    isOpen: false, isNew: true, isFeatured: true,
    location: { lat: 6.462, lng: 3.445 }, approvalStatus: "approved",
  },
  // All restaurants
  {
    id: "bankuli-pot", name: "Bankuli Pot", image: "/images/soup.jpg",
    cuisine: "Nigerian · Soups", category: "soup",
    rating: 5.0, reviewCount: 210, deliveryTime: "31-40",
    deliveryFee: 0, minOrder: 1200, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "20% off",
    location: { lat: 6.445, lng: 3.390 }, approvalStatus: "approved",
  },
  {
    id: "gracehouse", name: "Gracehouse Kitchen", image: "/images/Jollof stir-fry spaghetti.jpg",
    cuisine: "Nigerian · Home style", category: "rice",
    rating: 5.0, reviewCount: 67, deliveryTime: "31-40",
    deliveryFee: 150, minOrder: 1000, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: false,
    location: { lat: 6.455, lng: 3.430 }, approvalStatus: "approved",
  },
  {
    id: "burger-boy", name: "Burger Boy", image: "/images/hamburger.png",
    cuisine: "Fast food · Burgers", category: "burgers",
    rating: 5.0, reviewCount: 195, deliveryTime: "20-30",
    deliveryFee: 0, minOrder: 800, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "Free delivery",
    location: { lat: 6.430, lng: 3.415 }, approvalStatus: "approved",
  },
  {
    id: "pepper-spot", name: "The Pepper Spot", image: "/images/jollof.png",
    cuisine: "Nigerian · Grills", category: "grills",
    rating: 4.3, reviewCount: 58, deliveryTime: "35-45",
    deliveryFee: 250, minOrder: 1500, priceRange: 2,
    isOpen: true, isNew: true, isFeatured: false,
    location: { lat: 6.458, lng: 3.408 }, approvalStatus: "approved",
  },
  {
    id: "chill-sip-lounge", name: "Chill & Sip Lounge", image: "/images/friedrice.png",
    cuisine: "Drinks · Smoothies", category: "drinks",
    rating: 4.8, reviewCount: 112, deliveryTime: "15-25",
    deliveryFee: 100, minOrder: 500, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: false,
    location: { lat: 6.440, lng: 3.440 }, approvalStatus: "approved",
  },
  {
    id: "mamas-kitchen", name: "Mama's Kitchen", image: "/images/jollof.png",
    cuisine: "Nigerian · Home cooking", category: "rice",
    rating: 4.9, reviewCount: 301, deliveryTime: "40-55",
    deliveryFee: 0, minOrder: 1000, priceRange: 1,
    isOpen: false, isNew: false, isFeatured: false, promoLabel: "Popular",
    location: { lat: 6.465, lng: 3.395 }, approvalStatus: "approved",
  },
];

/* ── Shops (convenience / pharmacy / household) ──────────── */
export const SHOP_VENDORS: Vendor[] = [
  {
    id: "quickmart-express", name: "QuickMart Express", image: "/images/cart.png",
    cuisine: "Snacks, pantry & everyday essentials", category: "pantry",
    rating: 4.6, reviewCount: 158, deliveryTime: "20-30",
    deliveryFee: 0, minOrder: 1000, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: true, promoLabel: "Free delivery",
    location: { lat: 6.448, lng: 3.412 }, approvalStatus: "approved", businessType: "shop",
  },
  {
    id: "corner-pharmacy", name: "Corner Pharmacy & Wellness", image: "/images/food-basket.png",
    cuisine: "Medicine, personal care & wellness", category: "wellness",
    rating: 4.9, reviewCount: 76, deliveryTime: "15-25",
    deliveryFee: 300, minOrder: 500, priceRange: 2,
    isOpen: true, isNew: true, isFeatured: false,
    location: { lat: 6.441, lng: 3.428 }, approvalStatus: "approved", businessType: "shop",
  },
  {
    id: "daily-essentials", name: "Daily Essentials Store", image: "/images/max-food-basket.png",
    cuisine: "Household, cleaning & bakery goods", category: "household",
    rating: 4.4, reviewCount: 63, deliveryTime: "25-35",
    deliveryFee: 250, minOrder: 1500, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "20% off",
    location: { lat: 6.459, lng: 3.399 }, approvalStatus: "approved", businessType: "shop",
  },
];

/* ── Local markets (fresh produce) ───────────────────────── */
export const MARKET_VENDORS: Vendor[] = [
  {
    id: "ikoyi-fresh-market", name: "Ikoyi Fresh Market", image: "/images/fruit-basket.png",
    cuisine: "Fresh fruits, vegetables & produce", category: "produce",
    rating: 4.8, reviewCount: 194, deliveryTime: "30-40",
    deliveryFee: 0, minOrder: 1500, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: true, promoLabel: "Free delivery",
    location: { lat: 6.453, lng: 3.435 }, approvalStatus: "approved", businessType: "market",
  },
  {
    id: "green-valley-farms", name: "Green Valley Farms", image: "/images/vegetarian-drink.png",
    cuisine: "Grains, tubers & farm produce", category: "grains",
    rating: 4.7, reviewCount: 101, deliveryTime: "35-50",
    deliveryFee: 350, minOrder: 2000, priceRange: 2,
    isOpen: true, isNew: true, isFeatured: false,
    location: { lat: 6.436, lng: 3.418 }, approvalStatus: "approved", businessType: "market",
  },
  {
    id: "lagos-local-market", name: "Lagos Local Market", image: "/images/food-basket.png",
    cuisine: "Meat, seafood, spices & staples", category: "proteins",
    rating: 4.5, reviewCount: 87, deliveryTime: "30-45",
    deliveryFee: 200, minOrder: 1500, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "Popular",
    location: { lat: 6.463, lng: 3.407 }, approvalStatus: "approved", businessType: "market",
  },
];