import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { ShopsList } from "@/components/shop/ShopsList";
import "@/app/vendors-listing.css";

export const metadata: Metadata = {
  title: "Shops — TummyTime",
  description: "Browse grocery and essentials shops near you on TummyTime.",
};

export default function ShopsPage() {
  return (
    <>
      <Navigation />
      <ShopsList />
    </>
  );
}
