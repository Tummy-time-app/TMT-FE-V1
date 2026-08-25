import type { Metadata } from "next";
import { Suspense } from "react";
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
      {/* RestaurantsList reads ?q=... via useSearchParams(), which Next
          requires a Suspense boundary for even though nothing here actually
          suspends on it — otherwise this page can't be statically prerendered. */}
      <Suspense fallback={null}>
        <RestaurantsList />
      </Suspense>
    </>
  );
}
