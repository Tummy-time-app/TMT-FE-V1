import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { RestaurantsList } from "@/components/vendor/RestaurantsList";
import "@/app/vendors-listing.css";

export const metadata: Metadata = {
  title: "Restaurants — TummyTime",
  description: "Browse restaurants near you on TummyTime.",
};

export default function RestaurantsPage() {
  return (
    <>
      <Navigation />
      <RestaurantsList />
    </>
  );
}
