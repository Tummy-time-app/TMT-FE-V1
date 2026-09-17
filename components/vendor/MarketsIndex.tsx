"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";
import { getErrorMessage } from "@/lib/utils/apiError";
import { useProfile } from "@/lib/ProfileContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { SafeImage } from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangleIcon, StoreIcon } from "@/components/icons";

interface MarketGroup {
  name: string;
  stallCount: number;
  imageUrl?: string | null;
}

/**
 * Groups businessType="market" restaurants rows by their shared
 * businessCategory (the market's display name — see features/restaurants/
 * types.ts's doc comment) into one card per named market, instead of
 * listing every stall flat. Each card links to /vendors/markets/[marketName],
 * which reuses RestaurantsList filtered down to that one market's stalls.
 */
export function MarketsIndex() {
  const { data: stalls = [], isLoading, isError, error, refetch } = useListRestaurantsQuery({ businessType: "market" });
  const { profile } = useProfile();
  const locationLabel = profile.address.line1 || profile.address.city || "you";

  const markets = useMemo<MarketGroup[]>(() => {
    const byName = new Map<string, MarketGroup>();
    for (const stall of stalls) {
      const name = stall.businessCategory?.trim() || stall.name;
      const existing = byName.get(name);
      if (existing) {
        existing.stallCount += 1;
      } else {
        byName.set(name, { name, stallCount: 1, imageUrl: stall.imageUrl });
      }
    }
    return Array.from(byName.values());
  }, [stalls]);

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">Local markets near you</h1>
          <p className="vp-subtitle">Fresh produce and groceries from markets around {locationLabel}</p>
        </div>
      </header>

      <section className="vp-section">
        <div className="vp-section-row">
          <h2 className="vp-section-title">All markets</h2>
          <span className="vp-count">
            {markets.length} market{markets.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="vp-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="vc-card vc-card--skeleton" aria-hidden>
                <Skeleton style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 0 }} />
                <div className="vc-body">
                  <Skeleton style={{ width: "60%", height: 14, marginBottom: 8 }} />
                  <Skeleton style={{ width: "40%", height: 11 }} />
                </div>
              </div>
            ))
          ) : isError ? (
            <EmptyState
              icon={AlertTriangleIcon}
              title="Couldn't load markets"
              message={getErrorMessage(error)}
              action={
                <button className="vp-empty-cta" onClick={() => refetch()}>
                  Try again
                </button>
              }
            />
          ) : markets.length === 0 ? (
            <EmptyState icon={StoreIcon} title="No markets found" message="Check back soon — markets are being added." />
          ) : (
            markets.map((market) => (
              <div key={market.name} className="vc-card">
                <Link href={`/vendors/markets/${encodeURIComponent(market.name)}`} className="vc-card__link">
                  <div className="vc-img-wrap">
                    <div className="vc-img vc-img--placeholder">
                      <SafeImage
                        src={market.imageUrl}
                        alt={market.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="vc-img"
                      />
                    </div>
                  </div>
                  <div className="vc-body">
                    <p className="vc-name">{market.name}</p>
                    <p className="vc-cuisine">
                      {market.stallCount} stall{market.stallCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
