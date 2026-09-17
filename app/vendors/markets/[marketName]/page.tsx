import { Suspense } from "react";
import { Navigation } from "@/components/nav/Navigation";
import { RestaurantsList } from "@/components/vendor/RestaurantsList";
import "@/app/vendors-listing.css";

/**
 * A named market's stall list — same RestaurantsList used everywhere else,
 * filtered to businessType="market" rows sharing this businessCategory
 * (see components/vendor/MarketsIndex.tsx, which links here). A name with
 * no matching stalls (e.g. a stale link) just renders RestaurantsList's own
 * "No stalls found" empty state rather than a hard 404.
 */
export default async function MarketDetailPage({ params }: { params: Promise<{ marketName: string }> }) {
  const { marketName } = await params;
  const decodedName = decodeURIComponent(marketName);

  return (
    <>
      <Navigation />
      <Suspense fallback={null}>
        <RestaurantsList
          businessType="market"
          businessCategory={decodedName}
          heading={decodedName}
          subtitle="Browse stalls in this market"
          noun="stall"
          searchPlaceholder="Search stalls…"
          emptyIconKey="store"
        />
      </Suspense>
    </>
  );
}
