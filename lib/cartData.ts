export interface CartItem {
  id: number;
  name: string;
  vendor: string;
  vendorType: "restaurant" | "shop" | "market";
  price: number;
  qty: number;
  image: string;
  note?: string;
}

export const initialItems: CartItem[] = [
  {
    id: 1,
    name: "Jollof Rice + Chicken",
    vendor: "Mama's Kitchen",
    vendorType: "restaurant",
    price: 3500,
    qty: 2,
    image: "/images/jollof.png",
    note: "Extra spicy please",
  },
  {
    id: 2,
    name: "Beef Burger (Double)",
    vendor: "BurgerHub",
    vendorType: "restaurant",
    price: 4200,
    qty: 1,
    image: "/images/hamburger.png",
  },
  {
    id: 3,
    name: "Fried Rice + Plantain",
    vendor: "ChefDee's",
    vendorType: "restaurant",
    price: 2800,
    qty: 1,
    image: "/images/friedrice.png",
  },
];