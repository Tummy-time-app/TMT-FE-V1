import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/nav/Navigation";
import { RestaurantsList } from "@/components/vendor/RestaurantsList";
import "@/app/vendors-listing.css";

export const metadata: Metadata = {
  title: "Shops — TummyTime",
  description: "Browse grocery and essentials shops near you on TummyTime.",
};

export default function ShopsPage() {
  return (
    <>
      <Navigation />
      <Suspense fallback={null}>
        <RestaurantsList
          businessType="retail,other"
          heading="Shops near you"
          subtitle="Local businesses around {location}"
          noun="shop"
          searchPlaceholder="Search shops…"
          emptyIconKey="store"
        />
      </Suspense>
    </>
  );
}
