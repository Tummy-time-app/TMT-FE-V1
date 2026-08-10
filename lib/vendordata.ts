// types/vendor.ts  — or paste inline above your component

export type Vendor = {
  id: string;
  name: string;
  image: string;          // path under /public/images/vendors/
  cuisine: string;
  category: string;       // matches Category.id
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
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
};

/* ── seed data ─────────────────────────────────────────── */
export const CATEGORIES: Category[] = [
  { id: "all",      label: "All",        emoji: "🍽️",  gradient: "linear-gradient(135deg,#AC0000,#FFB703)" },
  { id: "pizza",    label: "Pizza",      emoji: "🍕",  gradient: "linear-gradient(135deg,#AC0000,#e05c00)" },
  { id: "drinks",   label: "Drinks",     emoji: "🥤",  gradient: "linear-gradient(135deg,#c25000,#FFB703)" },
  { id: "soup",     label: "Soups",      emoji: "🍲",  gradient: "linear-gradient(135deg,#8B0000,#c44b00)" },
  { id: "rice",     label: "Rice",       emoji: "🍛",  gradient: "linear-gradient(135deg,#AC0000,#b86a00)" },
  { id: "grills",   label: "Grills",     emoji: "🔥",  gradient: "linear-gradient(135deg,#7a0000,#AC0000)" },
  { id: "burgers",  label: "Burgers",    emoji: "🍔",  gradient: "linear-gradient(135deg,#b85000,#FFB703)" },
  { id: "desserts", label: "Desserts",   emoji: "🍰",  gradient: "linear-gradient(135deg,#c23a00,#e08000)" },
];

export const VENDORS: Vendor[] = [
  // Handpicked / featured
  {
    id: "mr-toms-spag-grills", name: "Mr Toms Spag & Grills", image: "/images/jollof-spaghetti.jpg",
    cuisine: "Italian · Grills", category: "grills",
    rating: 5.0, reviewCount: 142, deliveryTime: "31-40",
    deliveryFee: 0, minOrder: 1500, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: true, promoLabel: "Free delivery",
    location: { lat: 6.451, lng: 3.421 },
  },
  {
    id: "amarachi-food", name: "Amarachi Food", image: "/images/jollof__jolloffestival__yummy-removebg-preview.png",
    cuisine: "Nigerian · Local", category: "rice",
    rating: 4.7, reviewCount: 89, deliveryTime: "31-40",
    deliveryFee: 200, minOrder: 1000, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: true,
    location: { lat: 6.438, lng: 3.401 },
  },
  {
    id: "foodie", name: "Foodie.com", image: "/images/friedrice.png",
    cuisine: "Continental · Fast food", category: "burgers",
    rating: 3.5, reviewCount: 34, deliveryTime: "31-40",
    deliveryFee: 300, minOrder: 800, priceRange: 2,
    isOpen: false, isNew: true, isFeatured: true,
    location: { lat: 6.462, lng: 3.445 },
  },
  // All restaurants
  {
    id: "bankuli-pot", name: "Bankuli Pot", image: "/images/soup.jpg",
    cuisine: "Nigerian · Soups", category: "soup",
    rating: 5.0, reviewCount: 210, deliveryTime: "31-40",
    deliveryFee: 0, minOrder: 1200, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "20% off",
    location: { lat: 6.445, lng: 3.390 },
  },
  {
    id: "gracehouse", name: "Gracehouse Kitchen", image: "/images/Jollof stir-fry spaghetti.jpg",
    cuisine: "Nigerian · Home style", category: "rice",
    rating: 5.0, reviewCount: 67, deliveryTime: "31-40",
    deliveryFee: 150, minOrder: 1000, priceRange: 1,
    isOpen: true, isNew: false, isFeatured: false,
    location: { lat: 6.455, lng: 3.430 },
  },
  {
    id: "burger-boy", name: "Burger Boy", image: "/images/hamburger.png",
    cuisine: "Fast food · Burgers", category: "burgers",
    rating: 5.0, reviewCount: 195, deliveryTime: "20-30",
    deliveryFee: 0, minOrder: 800, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: false, promoLabel: "Free delivery",
    location: { lat: 6.430, lng: 3.415 },
  },
  {
    id: "pepper-spot", name: "The Pepper Spot", image: "/images/jollof.png",
    cuisine: "Nigerian · Grills", category: "grills",
    rating: 4.3, reviewCount: 58, deliveryTime: "35-45",
    deliveryFee: 250, minOrder: 1500, priceRange: 2,
    isOpen: true, isNew: true, isFeatured: false,
    location: { lat: 6.458, lng: 3.408 },
  },
  {
    id: "chill-sip-lounge", name: "Chill & Sip Lounge", image: "/images/friedrice.png",
    cuisine: "Drinks · Smoothies", category: "drinks",
    rating: 4.8, reviewCount: 112, deliveryTime: "15-25",
    deliveryFee: 100, minOrder: 500, priceRange: 2,
    isOpen: true, isNew: false, isFeatured: false,
    location: { lat: 6.440, lng: 3.440 },
  },
  {
    id: "mamas-kitchen", name: "Mama's Kitchen", image: "/images/jollof.png",
    cuisine: "Nigerian · Home cooking", category: "rice",
    rating: 4.9, reviewCount: 301, deliveryTime: "40-55",
    deliveryFee: 0, minOrder: 1000, priceRange: 1,
    isOpen: false, isNew: false, isFeatured: false, promoLabel: "Popular",
    location: { lat: 6.465, lng: 3.395 },
  },
];