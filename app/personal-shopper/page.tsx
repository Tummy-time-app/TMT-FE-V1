import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { PersonalShopperView } from "@/components/personalShopper/PersonalShopperView";
import "@/app/orders.css";
import "@/app/vendors-listing.css";
import "@/app/personal-shopper.css";

export const metadata: Metadata = {
  title: "Personal Shopper — TummyTime",
  description: "Have a TummyTime shopper pick and deliver items for you.",
};

export default function PersonalShopperPage() {
  return (
    <>
      <Navigation />
      <PersonalShopperView />
    </>
  );
}
