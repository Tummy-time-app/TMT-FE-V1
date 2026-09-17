import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/nav/Navigation";
import { RestaurantsList } from "@/components/vendor/RestaurantsList";
import "@/app/vendors-listing.css";

export const metadata: Metadata = {
  title: "Groceries — TummyTime",
  description: "Order groceries and household essentials from nearby stores on TummyTime.",
};

export default function GroceriesPage() {
  return (
    <>
      <Navigation />
      <Suspense fallback={null}>
        <RestaurantsList
          businessType="grocery"
          heading="Groceries near you"
          subtitle="Order groceries and essentials around {location}"
          noun="grocery store"
          searchPlaceholder="Search grocery stores…"
          emptyIconKey="basket"
        />
      </Suspense>
    </>
  );
}
