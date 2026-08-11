import { VENDORS } from './vendordata';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  available: boolean;
}

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


// Mock menus for other vendors
// Remove incomplete MOCK_MENUS for now to fix syntax. Will add full mocks later if needed.
const MOCK_MENUS: Record<string, RestaurantData> = {};


/** Get restaurant data by id, fallback to Gracehouse, null if unknown */
export function getRestaurantData(id: string): RestaurantData | null {
  // const slug = id.replace("restaurants/", "");
  
  const vendor = VENDORS.find(v => v.id === id);

  if (!vendor) return null;

  // Gracehouse aliases
  if (id === 'gracehouse' ) {
    return GRACEHOUSE_BASE;
  }

  // Mock for others (extend later)
  const mock = MOCK_MENUS[id as keyof typeof MOCK_MENUS];
  if (mock) return mock;


  // Fallback generic
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
      image: '/images/jollof.png',
      logo: '/images/logo/tummytime-logo.png',
      tags: [vendor.cuisine.split(' · ')[0]],
      categories: ['Popular'],
      location: vendor.location,
      approvalStatus: vendor.approvalStatus,
    },
    menuItems: GRACEHOUSE_BASE.menuItems,
  };

}
