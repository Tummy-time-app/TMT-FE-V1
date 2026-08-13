import { VENDORS, SHOP_VENDORS, MARKET_VENDORS } from './vendordata';
import type { MenuItem } from '@/features/vendors/types';

export type { MenuItem };

/** Every static seed vendor, across all three business types — `getRestaurantData` resolves against this, not just restaurants. */
const ALL_STATIC_VENDORS = [...VENDORS, ...SHOP_VENDORS, ...MARKET_VENDORS];

export interface CartEntry {
  item: MenuItem;
  qty: number;
  note?: string;
}

export interface RestaurantData {
  restaurant: {
    id: string;
    name: string;
    tagline: string;
    rating: number;
    reviews: number;
    deliveryTime: string;
    deliveryFee: number;
    minOrder: number;
    address?: string;
    isOpen: boolean;
    openHours?: string;
    image: string;
    logo: string;
    tags: string[];
    categories: string[];
    location: { lat: number; lng: number };
    approvalStatus: "pending" | "approved" | "suspended";
  };
  menuItems: MenuItem[];
}

// Gracehouse base data (existing)
const GRACEHOUSE_BASE: RestaurantData = {
  restaurant: {
    id: "gracehouse",
    name: "Gracehouse Kitchen",
    tagline: "African & Continental · Home-style cooking",
    rating: 5.0,
    reviews: 248,
    deliveryTime: "31–40 min",
    deliveryFee: 500,
    minOrder: 2000,
    address: "12 Awolowo Rd, Ikoyi, Lagos",
    isOpen: true,
    openHours: "8:00 AM – 10:00 PM",
    image: "/images/jollof.png",
    logo: "/images/logo/tummytime-logo.png",
    tags: ["African", "Continental", "Rice dishes", "Proteins"],
    categories: ["Popular", "Rice & Swallows", "Proteins", "Sides", "Drinks"],
    location: { lat: 6.455, lng: 3.430 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1,  name: "Jollof Rice + Chicken",   description: "Smoky party jollof with golden fried chicken, coleslaw & fried plantain",  price: 3500, image: "/images/jollof.png",     category: "Popular",          popular: true,  spicy: true,  available: true },
    { id: 2,  name: "Fried Rice + Beef",        description: "Nigerian-style fried rice with seasoned beef steak & coleslaw",             price: 3200, image: "/images/friedrice.png", category: "Popular",          popular: true,  available: true },
    { id: 3,  name: "White Rice + Egusi Soup",  description: "Fluffy white rice served with rich egusi soup & assorted meat",            price: 3000, image: "/images/jollof.png",     category: "Rice & Swallows",  available: true },
    { id: 4,  name: "Amala + Ewedu",            description: "Smooth amala with fresh ewedu soup, gbegiri & assorted meat",              price: 2800, image: "/images/friedrice.png", category: "Rice & Swallows",  available: true },
    { id: 5,  name: "Ofada Rice + Stew",        description: "Local ofada rice with designer ofada stew & fried ponmo",                  price: 3500, image: "/images/jollof.png",     category: "Rice & Swallows",  spicy: true,  available: true },
    { id: 6,  name: "Grilled Catfish",          description: "Whole grilled catfish marinated in suya spice, served with pepper sauce",  price: 5500, image: "/images/friedrice.png", category: "Proteins",         popular: true,  spicy: true,  available: true },
    { id: 7,  name: "Peppered Chicken (Full)",  description: "Full chicken pressure-cooked & pan-fried in peppered sauce",               price: 6000, image: "/images/jollof.png",     category: "Proteins",         spicy: true,  available: true },
    { id: 8,  name: "Beef Suya (500g)",         description: "Thin-sliced seasoned beef suya with onions & fresh tomato",                price: 3500, image: "/images/friedrice.png", category: "Proteins",         spicy: true,  available: true },
    { id: 9,  name: "Moi Moi (x2)",             description: "Steamed bean pudding with egg, fish & seasoning",                         price: 1200, image: "/images/jollof.png",     category: "Sides",            vegetarian: true, available: true },
    { id: 10, name: "Fried Plantain",           description: "Sweet, caramelised dodo fried to golden perfection",                      price: 800,  image: "/images/friedrice.png", category: "Sides",            vegetarian: true, available: true },
    { id: 11, name: "Coleslaw",                 description: "Creamy house coleslaw with a hint of lime",                               price: 600,  image: "/images/jollof.png",     category: "Sides",            vegetarian: true, available: false },
    { id: 12, name: "Chapman (500ml)",          description: "Classic Nigerian chapman with citrus & grenadine",                        price: 1000, image: "/images/friedrice.png", category: "Drinks",           available: true },
    { id: 13, name: "Zobo Drink (500ml)",       description: "Chilled hibiscus drink with ginger & pineapple flavour",                  price: 700,  image: "/images/jollof.png",     category: "Drinks",           available: true },
  ] as MenuItem[],
} as const;

/* ── Shops & Local Markets — real, distinct catalogs per vendor ──
   Every item here is `productType: "grocery_item"`. Produce/meat/fish
   sold `unitType: "weight"` prices per kg (the stepper adds in 0.5kg
   increments — see components/vendor/StoreDetailClient.tsx); packaged
   goods are `unitType: "each"`. `substitutionAllowed` marks perishables
   where a rider substitution makes sense if the exact item is out. */

const QUICKMART_EXPRESS: RestaurantData = {
  restaurant: {
    id: "quickmart-express",
    name: "QuickMart Express",
    tagline: "Snacks, pantry & everyday essentials",
    rating: 4.6,
    reviews: 158,
    deliveryTime: "20–30 min",
    deliveryFee: 0,
    minOrder: 1000,
    address: "4 Bourdillon Rd, Ikoyi, Lagos",
    isOpen: true,
    openHours: "7:00 AM – 11:00 PM",
    image: "/images/cart.png",
    logo: "/images/cart.png",
    tags: ["Convenience", "Snacks", "Beverages", "Household"],
    categories: ["Popular", "Snacks & Pantry", "Beverages", "Household"],
    location: { lat: 6.448, lng: 3.412 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Indomie Instant Noodles (Pack of 5)", description: "Classic chicken-flavour instant noodles, family pack", price: 1200, image: "/images/cart.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 2, name: "Digestive Biscuits", description: "Crunchy wheat digestive biscuits, family pack", price: 900, image: "/images/cart.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 3, name: "Coca-Cola 50cl (Pack of 6)", description: "Chilled classic Coca-Cola, six-pack", price: 2400, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 4, name: "Golden Morn Cereal 500g", description: "Fortified maize cereal, breakfast pack", price: 1800, image: "/images/cart.png", category: "Snacks & Pantry", available: true, productType: "grocery_item", unitType: "each" },
    { id: 5, name: "Pringles Original", description: "Crispy stacked potato chips, 110g can", price: 2500, image: "/images/cart.png", category: "Snacks & Pantry", available: true, productType: "grocery_item", unitType: "each" },
    { id: 6, name: "Milo Refill 500g", description: "Chocolate malt drink refill pack", price: 2800, image: "/images/cart.png", category: "Snacks & Pantry", available: false, productType: "grocery_item", unitType: "each" },
    { id: 7, name: "Bottled Water 75cl", description: "Pure table water, single bottle", price: 300, image: "/images/food-basket.png", category: "Beverages", available: true, productType: "grocery_item", unitType: "each" },
    { id: 8, name: "Tissue Paper (Pack of 4)", description: "Soft 2-ply toilet tissue, pack of 4 rolls", price: 1500, image: "/images/max-food-basket.png", category: "Household", available: true, productType: "grocery_item", unitType: "each" },
    { id: 9, name: "Dettol Antiseptic 500ml", description: "Antiseptic disinfectant liquid for home & first aid", price: 2200, image: "/images/max-food-basket.png", category: "Household", available: true, productType: "grocery_item", unitType: "each" },
  ] as MenuItem[],
};

const CORNER_PHARMACY: RestaurantData = {
  restaurant: {
    id: "corner-pharmacy",
    name: "Corner Pharmacy & Wellness",
    tagline: "Medicine, personal care & wellness",
    rating: 4.9,
    reviews: 76,
    deliveryTime: "15–25 min",
    deliveryFee: 300,
    minOrder: 500,
    address: "9 Alexander Ave, Ikoyi, Lagos",
    isOpen: true,
    openHours: "24 hours",
    image: "/images/food-basket.png",
    logo: "/images/food-basket.png",
    tags: ["Pharmacy", "Wellness", "Baby care"],
    categories: ["Popular", "Medicine", "Personal Care", "Baby & Family"],
    location: { lat: 6.441, lng: 3.428 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Paracetamol Tablets (20s)", description: "Pain & fever relief tablets, pack of 20", price: 500, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 2, name: "Panadol Extra (12s)", description: "Fast-acting pain relief with caffeine, pack of 12", price: 900, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 3, name: "Baby Diapers (Size 3, 20pcs)", description: "Soft absorbent diapers for 4–9kg babies", price: 4500, image: "/images/max-food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 4, name: "Vitamin C Effervescent (10s)", description: "Immune-support effervescent tablets, orange flavour", price: 1800, image: "/images/food-basket.png", category: "Medicine", available: true, productType: "grocery_item", unitType: "each" },
    { id: 5, name: "First Aid Kit", description: "Compact home first-aid kit with plasters, gauze & antiseptic", price: 3500, image: "/images/max-food-basket.png", category: "Medicine", available: true, productType: "grocery_item", unitType: "each" },
    { id: 6, name: "Hand Sanitizer 250ml", description: "70% alcohol gel hand sanitizer", price: 1200, image: "/images/food-basket.png", category: "Personal Care", available: true, productType: "grocery_item", unitType: "each" },
    { id: 7, name: "Toothpaste + Toothbrush Combo", description: "Fluoride toothpaste with a soft-bristle toothbrush", price: 1500, image: "/images/food-basket.png", category: "Personal Care", available: false, productType: "grocery_item", unitType: "each" },
    { id: 8, name: "Baby Wipes (80 sheets)", description: "Fragrance-free gentle baby wipes", price: 1300, image: "/images/max-food-basket.png", category: "Baby & Family", available: true, productType: "grocery_item", unitType: "each" },
  ] as MenuItem[],
};

const DAILY_ESSENTIALS: RestaurantData = {
  restaurant: {
    id: "daily-essentials",
    name: "Daily Essentials Store",
    tagline: "Household, cleaning & bakery goods",
    rating: 4.4,
    reviews: 63,
    deliveryTime: "25–35 min",
    deliveryFee: 250,
    minOrder: 1500,
    address: "21 Glover Rd, Ikoyi, Lagos",
    isOpen: true,
    openHours: "8:00 AM – 9:00 PM",
    image: "/images/max-food-basket.png",
    logo: "/images/max-food-basket.png",
    tags: ["Household", "Bakery", "Cleaning"],
    categories: ["Popular", "Bakery", "Cleaning", "Household"],
    location: { lat: 6.459, lng: 3.399 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Sliced Bread (Family Loaf)", description: "Freshly baked soft white family loaf", price: 1200, image: "/images/max-food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 2, name: "Laundry Detergent 1kg", description: "Powerful stain-fighting laundry powder", price: 1800, image: "/images/max-food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 3, name: "Meat Pie (Pack of 4)", description: "Golden-baked meat pies, pack of 4", price: 2000, image: "/images/food-basket.png", category: "Bakery", available: true, productType: "grocery_item", unitType: "each" },
    { id: 4, name: "Doughnuts (6pcs)", description: "Soft sugar-glazed doughnuts, box of 6", price: 1500, image: "/images/food-basket.png", category: "Bakery", available: true, productType: "grocery_item", unitType: "each" },
    { id: 5, name: "Dishwashing Liquid 750ml", description: "Grease-cutting dishwashing liquid, lemon scent", price: 1100, image: "/images/max-food-basket.png", category: "Cleaning", available: true, productType: "grocery_item", unitType: "each" },
    { id: 6, name: "Trash Bags (Roll of 20)", description: "Heavy-duty bin liners, roll of 20", price: 900, image: "/images/max-food-basket.png", category: "Cleaning", available: false, productType: "grocery_item", unitType: "each" },
    { id: 7, name: "Air Freshener Spray", description: "Long-lasting home fragrance spray", price: 1400, image: "/images/food-basket.png", category: "Household", available: true, productType: "grocery_item", unitType: "each" },
  ] as MenuItem[],
};

const IKOYI_FRESH_MARKET: RestaurantData = {
  restaurant: {
    id: "ikoyi-fresh-market",
    name: "Ikoyi Fresh Market",
    tagline: "Fresh fruits, vegetables & produce",
    rating: 4.8,
    reviews: 194,
    deliveryTime: "30–40 min",
    deliveryFee: 0,
    minOrder: 1500,
    address: "Ikoyi Local Market, Lagos",
    isOpen: true,
    openHours: "6:00 AM – 7:00 PM",
    image: "/images/fruit-basket.png",
    logo: "/images/fruit-basket.png",
    tags: ["Fresh produce", "Fruits", "Vegetables"],
    categories: ["Popular", "Vegetables", "Fruits", "Herbs & Spices"],
    location: { lat: 6.453, lng: 3.435 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Scotch Bonnet Peppers", description: "Fiery fresh scotch bonnet peppers, sold per kg", price: 1500, image: "/images/chilli.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 2, name: "Ripe Plantain (Bunch)", description: "Sweet ripe plantain, whole bunch", price: 1200, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each", substitutionAllowed: true },
    { id: 3, name: "Fresh Tomatoes", description: "Vine-ripened tomatoes, sold per kg", price: 800, image: "/images/tomato.png", category: "Vegetables", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 4, name: "Red Onions", description: "Fresh red onions, sold per kg", price: 600, image: "/images/food-basket.png", category: "Vegetables", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 5, name: "Eggplant (Garden Egg)", description: "Fresh garden eggs, sold per kg", price: 700, image: "/images/eggplant.png", category: "Vegetables", available: false, productType: "grocery_item", unitType: "weight", weightUnit: "kg" },
    { id: 6, name: "Watermelon (Whole)", description: "Sweet, juicy whole watermelon", price: 2000, image: "/images/fruit-basket.png", category: "Fruits", available: true, productType: "grocery_item", unitType: "each" },
    { id: 7, name: "Pineapple (Whole)", description: "Ripe golden pineapple", price: 1000, image: "/images/pineapple.png", category: "Fruits", available: true, productType: "grocery_item", unitType: "each", substitutionAllowed: true },
    { id: 8, name: "Fresh Ginger", description: "Aromatic fresh ginger root, sold per kg", price: 2000, image: "/images/food-basket.png", category: "Herbs & Spices", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg" },
    { id: 9, name: "Garlic Bulbs", description: "Fresh garlic bulbs, sold per kg", price: 2500, image: "/images/olive.png", category: "Herbs & Spices", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg" },
  ] as MenuItem[],
};

const GREEN_VALLEY_FARMS: RestaurantData = {
  restaurant: {
    id: "green-valley-farms",
    name: "Green Valley Farms",
    tagline: "Grains, tubers & farm produce",
    rating: 4.7,
    reviews: 101,
    deliveryTime: "35–50 min",
    deliveryFee: 350,
    minOrder: 2000,
    address: "Mile 12 Farm Depot, Lagos",
    isOpen: true,
    openHours: "6:00 AM – 6:00 PM",
    image: "/images/vegetarian-drink.png",
    logo: "/images/vegetarian-drink.png",
    tags: ["Grains", "Tubers", "Legumes"],
    categories: ["Popular", "Grains", "Tubers", "Legumes"],
    location: { lat: 6.436, lng: 3.418 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Long Grain Rice (5kg)", description: "Premium stone-free long grain rice, 5kg bag", price: 8500, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 2, name: "Yam Tubers (Medium)", description: "Fresh medium-size yam tuber", price: 1800, image: "/images/potato.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each", substitutionAllowed: true },
    { id: 3, name: "Brown Beans (2kg)", description: "Sorted honey brown beans, 2kg pack", price: 3200, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 4, name: "Yellow Garri (2kg)", description: "Roasted yellow garri, 2kg pack", price: 2200, image: "/images/vegetarian-drink.png", category: "Grains", available: true, productType: "grocery_item", unitType: "each" },
    { id: 5, name: "Sweet Potatoes", description: "Fresh sweet potatoes, sold per kg", price: 900, image: "/images/potato.png", category: "Tubers", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 6, name: "Cassava Tubers", description: "Fresh cassava roots, sold per kg", price: 500, image: "/images/potato.png", category: "Tubers", available: false, productType: "grocery_item", unitType: "weight", weightUnit: "kg" },
    { id: 7, name: "Groundnuts (1kg)", description: "Roasted shelled groundnuts, 1kg pack", price: 1500, image: "/images/food-basket.png", category: "Legumes", available: true, productType: "grocery_item", unitType: "each" },
  ] as MenuItem[],
};

const LAGOS_LOCAL_MARKET: RestaurantData = {
  restaurant: {
    id: "lagos-local-market",
    name: "Lagos Local Market",
    tagline: "Meat, seafood, spices & staples",
    rating: 4.5,
    reviews: 87,
    deliveryTime: "30–45 min",
    deliveryFee: 200,
    minOrder: 1500,
    address: "Oyingbo Market, Lagos",
    isOpen: true,
    openHours: "6:00 AM – 8:00 PM",
    image: "/images/food-basket.png",
    logo: "/images/food-basket.png",
    tags: ["Meat", "Seafood", "Spices"],
    categories: ["Popular", "Meat & Poultry", "Seafood", "Spices"],
    location: { lat: 6.463, lng: 3.407 },
    approvalStatus: "approved",
  },
  menuItems: [
    { id: 1, name: "Fresh Chicken (Whole)", description: "Whole dressed chicken, farm fresh", price: 6500, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "each" },
    { id: 2, name: "Beef Cuts", description: "Prime beef cuts, sold per kg", price: 4500, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 3, name: "Fresh Catfish", description: "Live fresh catfish, sold per kg", price: 3500, image: "/images/food-basket.png", category: "Popular", popular: true, available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 4, name: "Goat Meat", description: "Fresh goat meat, sold per kg", price: 5500, image: "/images/food-basket.png", category: "Meat & Poultry", available: true, productType: "grocery_item", unitType: "weight", weightUnit: "kg", substitutionAllowed: true },
    { id: 5, name: "Turkey Drumsticks", description: "Frozen turkey drumsticks, sold per kg", price: 4800, image: "/images/max-food-basket.png", category: "Meat & Poultry", available: false, productType: "grocery_item", unitType: "weight", weightUnit: "kg" },
    { id: 6, name: "Dried Fish (Smoked)", description: "Traditional smoked dried fish", price: 4000, image: "/images/food-basket.png", category: "Seafood", available: true, productType: "grocery_item", unitType: "each" },
    { id: 7, name: "Prawns (500g)", description: "Fresh jumbo prawns, 500g pack", price: 5000, image: "/images/food-basket.png", category: "Seafood", available: true, productType: "grocery_item", unitType: "each" },
    { id: 8, name: "Suya Spice Mix", description: "House-blend suya pepper spice mix", price: 1200, image: "/images/chilli.png", category: "Spices", available: true, productType: "grocery_item", unitType: "each" },
    { id: 9, name: "Curry & Thyme Combo", description: "Ground curry powder & dried thyme pack", price: 800, image: "/images/food-basket.png", category: "Spices", available: true, productType: "grocery_item", unitType: "each" },
  ] as MenuItem[],
};

// Mock menus for other vendors — restaurants share Gracehouse's menu via the
// generic fallback below; shops/markets each get a real, distinct catalog.
const MOCK_MENUS: Record<string, RestaurantData> = {
  "quickmart-express": QUICKMART_EXPRESS,
  "corner-pharmacy": CORNER_PHARMACY,
  "daily-essentials": DAILY_ESSENTIALS,
  "ikoyi-fresh-market": IKOYI_FRESH_MARKET,
  "green-valley-farms": GREEN_VALLEY_FARMS,
  "lagos-local-market": LAGOS_LOCAL_MARKET,
};


/** Get restaurant/shop/market data by id, fallback to Gracehouse's menu (restaurants only), null if unknown */
export function getRestaurantData(id: string): RestaurantData | null {
  const vendor = ALL_STATIC_VENDORS.find(v => v.id === id);

  if (!vendor) return null;

  // Gracehouse aliases
  if (id === 'gracehouse' ) {
    return GRACEHOUSE_BASE;
  }

  const mock = MOCK_MENUS[id as keyof typeof MOCK_MENUS];
  if (mock) return mock;

  // Fallback generic (restaurants only, by construction — every shop/market
  // vendor has an explicit MOCK_MENUS entry above). Categories mirror
  // Gracehouse's full set (not just "Popular") so every section of its
  // shared menu actually renders instead of only the 2 items tagged Popular.
  return {
    restaurant: {
      id,
      name: vendor.name,
      tagline: vendor.cuisine,
      rating: vendor.rating,
      reviews: vendor.reviewCount,
      deliveryTime: vendor.deliveryTime,
      deliveryFee: vendor.deliveryFee,
      minOrder: vendor.minOrder,
      isOpen: vendor.isOpen,
      openHours: '8:00 AM – 10:00 PM',
      image: vendor.image,
      logo: '/images/logo/tummytime-logo.png',
      tags: [vendor.cuisine.split(' · ')[0]],
      categories: GRACEHOUSE_BASE.restaurant.categories,
      location: vendor.location,
      approvalStatus: vendor.approvalStatus,
    },
    menuItems: GRACEHOUSE_BASE.menuItems,
  };

}
