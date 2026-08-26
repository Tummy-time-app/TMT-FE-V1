"use client";

import { useMemo, useState } from "react";
import { useListMarketsQuery } from "@/features/markets/marketsApi";
import { getErrorMessage } from "@/lib/utils/apiError";
import { useProfile } from "@/lib/ProfileContext";
import { DUMMY_MARKETS } from "@/lib/dummy/markets.dummy";
import { EmptyState } from "@/components/ui/EmptyState";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { AlertTriangleIcon, LeafIcon, SearchIcon, CloseIcon } from "@/components/icons";
import { MarketCard, MarketCardSkeleton } from "./MarketCard";

/** Priority 4 (net-new, intentionally lighter — see the redesign plan's Phase 5). Simplest of the three listing pages: a handful of seeded markets (lib/mocks/markets.mock.ts) don't need a category rail or filter sheet, just search. */
export function MarketsList() {
  const { data: markets = [], isLoading, isError, error, refetch } = useListMarketsQuery();
  const { profile } = useProfile();
  const locationLabel = profile.address.line1 || profile.address.city || "you";

  const [search, setSearch] = useState("");

  // Only when the query genuinely succeeded with nothing — never on
  // loading or error, which already have their own states below.
  const isDummy = !isLoading && !isError && markets.length === 0;
  const sourceMarkets = isDummy ? DUMMY_MARKETS : markets;

  const filtered = useMemo(() => {
    if (!search.trim()) return sourceMarkets;
    const q = search.trim().toLowerCase();
    return sourceMarkets.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.categories ?? []).some((c) => c.toLowerCase().includes(q)),
    );
  }, [sourceMarkets, search]);

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">Explore local markets</h1>
          <p className="vp-subtitle">Fresh produce and local vendors around {locationLabel}</p>
        </div>

        <div className="vp-search-wrap">
          <SearchIcon className="vp-search-icon" />
          <input
            type="text"
            className="vp-search-input"
            placeholder="Search markets or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search markets"
          />
          {search && (
            <button className="vp-search-clear" onClick={() => setSearch("")} aria-label="Clear">
              <CloseIcon width={12} height={12} />
            </button>
          )}
        </div>
      </header>

      <section className="vp-section">
        <div className="vp-section-row">
          <h2 className="vp-section-title">All markets</h2>
          <span className="vp-count">{filtered.length} markets</span>
        </div>

        {isDummy && filtered.length > 0 && <DummyBanner message="No markets have been added yet — showing sample markets so you can see how this page works." />}

        <div className="vp-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MarketCardSkeleton key={i} />)
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
          ) : filtered.length === 0 ? (
            <EmptyState icon={LeafIcon} title="No markets found" message="Try a different search." />
          ) : (
            filtered.map((market) => <MarketCard key={market.id} market={market} />)
          )}
        </div>
      </section>
    </main>
  );
}
