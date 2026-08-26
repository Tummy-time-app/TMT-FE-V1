"use client";

import { useMemo } from "react";
import { useDiscoverFoodQuery } from "@/features/food/foodApi";
import { getMenuItemDisplayMeta, getRestaurantDisplayMeta } from "@/lib/storefront/displayMeta";
import { useFavorites } from "@/lib/useFavorites";
import { useProfile } from "@/lib/ProfileContext";
import { getErrorMessage } from "@/lib/utils/apiError";
import { DUMMY_FOOD_LISTINGS } from "@/lib/dummy/food.dummy";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { AlertTriangleIcon } from "@/components/icons";
import { FoodItemCard } from "./FoodItemCard";
import type { FoodListing } from "@/features/food/types";

function Rail({ title, subtitle, listings }: { title: string; subtitle?: string; listings: FoodListing[] }) {
  if (listings.length === 0) return null;
  return (
    <section className="food-rail">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="food-rail__scroller">
        {listings.map((l) => (
          <FoodItemCard key={`${l.restaurant.id}-${l.item.id}`} listing={l} />
        ))}
      </div>
    </section>
  );
}

function RailSkeleton({ title }: { title: string }) {
  return (
    <section className="food-rail" aria-hidden>
      <SectionHeader title={title} />
      <div className="food-rail__scroller">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 168, flexShrink: 0 }}>
            <Skeleton style={{ width: "100%", aspectRatio: "1 / 1", marginBottom: 8 }} />
            <Skeleton style={{ width: "80%", height: 12, marginBottom: 6 }} />
            <Skeleton style={{ width: "50%", height: 10 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Priority 3 (net-new — see the plan's Phase 4). Unlike the restaurant
 * listing page, this isn't "browse vendors" — it's "browse dishes",
 * aggregated across every restaurant via features/food/foodApi.ts. Every
 * rail is built from a real signal rather than invented "personalization":
 * "Recommended for you" reads lib/useFavorites.ts's actual saved-
 * restaurants list (empty until the customer favorites something —
 * doesn't render if there's nothing to recommend from), "New dishes"
 * sorts MenuItem.createdAt (a real field, just never surfaced anywhere
 * before), "Deals"/"Popular"/"Under ₦X" reuse lib/storefront/
 * displayMeta.ts's already-established placeholder fields, and "Nigerian
 * favourites"/"Quick meals"/"Top rated" filter on real cuisine/delivery-
 * time/rating data. Any rail with nothing in it just doesn't render —
 * this page never shows an empty carousel.
 */
export function FoodDiscovery() {
  const { data: listings = [], isLoading, isError, error, refetch } = useDiscoverFoodQuery();
  const { isFavorite } = useFavorites();
  const { profile } = useProfile();
  const locationLabel = profile.address.line1 || profile.address.city || "you";

  const rails = useMemo(() => {
    const popular = listings.filter((l) => getMenuItemDisplayMeta(l.item).isPopular);

    const recommended = listings.filter((l) => isFavorite(l.restaurant.id));

    const quick = listings.filter((l) => getRestaurantDisplayMeta(l.restaurant).deliveryEtaMinutes <= 30);

    const nigerian = listings.filter((l) => (l.restaurant.cuisine ?? "").toLowerCase().includes("nigerian"));

    const prices = listings.map((l) => Number(l.item.price)).filter((p) => !Number.isNaN(p));
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const priceThreshold = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : 0;
    const underThreshold = listings.filter((l) => Number(l.item.price) <= priceThreshold);

    const topRated = listings.filter((l) => Number(l.restaurant.rating ?? 0) >= 4.5);

    const newDishes = listings
      .filter((l) => Boolean(l.item.createdAt))
      .sort((a, b) => new Date(b.item.createdAt ?? 0).getTime() - new Date(a.item.createdAt ?? 0).getTime())
      .slice(0, 10);

    const deals = listings.filter((l) => getRestaurantDisplayMeta(l.restaurant).promoLabel != null);

    return { popular, recommended, quick, nigerian, underThreshold, priceThreshold, topRated, newDishes, deals };
  }, [listings, isFavorite]);

  return (
    <main className="food-root">
      <header className="food-header">
        <h1 className="food-title">What are you craving?</h1>
        <p className="food-subtitle">Curated dishes around {locationLabel}</p>
      </header>

      {isLoading ? (
        <>
          <RailSkeleton title="Popular right now" />
          <RailSkeleton title="Top rated" />
          <RailSkeleton title="Deals" />
        </>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangleIcon}
          title="Couldn't load dishes"
          message={getErrorMessage(error)}
          action={
            <button className="vp-empty-cta" onClick={() => refetch()}>
              Try again
            </button>
          }
        />
      ) : listings.length === 0 ? (
        <>
          <DummyBanner message="No dishes to discover yet — showing sample dishes so you can see how this page works." />
          <Rail title="Sample dishes" listings={DUMMY_FOOD_LISTINGS} />
        </>
      ) : (
        <>
          <Rail title="Popular right now" listings={rails.popular} />
          <Rail title="Recommended for you" subtitle="From restaurants you've saved" listings={rails.recommended} />
          <Rail title="Quick meals" subtitle="30 minutes or less" listings={rails.quick} />
          <Rail title="Nigerian favourites" listings={rails.nigerian} />
          {rails.underThreshold.length > 0 && (
            <Rail title={`Under ₦${rails.priceThreshold.toLocaleString()}`} listings={rails.underThreshold} />
          )}
          <Rail title="Top rated" listings={rails.topRated} />
          <Rail title="New dishes" listings={rails.newDishes} />
          <Rail title="Deals" listings={rails.deals} />
        </>
      )}
    </main>
  );
}
