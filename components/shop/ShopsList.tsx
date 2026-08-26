"use client";

import { useMemo, useState } from "react";
import { useListShopsQuery } from "@/features/shops/shopsApi";
import { getErrorMessage } from "@/lib/utils/apiError";
import { useProfile } from "@/lib/ProfileContext";
import { DUMMY_SHOPS } from "@/lib/dummy/shops.dummy";
import { EmptyState } from "@/components/ui/EmptyState";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { CategoryRail, type CategoryRailItem } from "@/components/marketplace/CategoryRail";
import { AlertTriangleIcon, BasketIcon, SearchIcon, CloseIcon } from "@/components/icons";
import { ShopCard, ShopCardSkeleton } from "./ShopCard";

/**
 * Priority 4 (net-new, intentionally lighter than the restaurant listing
 * page — see the redesign plan's Phase 5). Reuses the same shared
 * primitives (CategoryRail, EmptyState) as the restaurant page so it
 * still feels like the same product, just without a full filter sheet —
 * a handful of seeded shops (lib/mocks/shops.mock.ts) don't need one yet.
 */
export function ShopsList() {
  const { data: shops = [], isLoading, isError, error, refetch } = useListShopsQuery();
  const { profile } = useProfile();
  const locationLabel = profile.address.line1 || profile.address.city || "you";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Only when the query genuinely succeeded with nothing — never on
  // loading or error, which already have their own states below.
  const isDummy = !isLoading && !isError && shops.length === 0;
  const sourceShops = isDummy ? DUMMY_SHOPS : shops;

  const categories = useMemo(() => {
    const set = new Set(sourceShops.map((s) => s.category).filter((c): c is string => Boolean(c)));
    return Array.from(set);
  }, [sourceShops]);

  const railItems: CategoryRailItem[] = useMemo(
    () => [{ id: "all", label: "All", icon: BasketIcon }, ...categories.map((c) => ({ id: c, label: c }))],
    [categories],
  );

  const filtered = useMemo(() => {
    let list = [...sourceShops];
    if (activeCategory !== "all") list = list.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.category ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [sourceShops, activeCategory, search]);

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">Shop the essentials</h1>
          <p className="vp-subtitle">Groceries and daily essentials around {locationLabel}</p>
        </div>

        <div className="vp-search-wrap">
          <SearchIcon className="vp-search-icon" />
          <input
            type="text"
            className="vp-search-input"
            placeholder="Search shops or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search shops"
          />
          {search && (
            <button className="vp-search-clear" onClick={() => setSearch("")} aria-label="Clear">
              <CloseIcon width={12} height={12} />
            </button>
          )}
        </div>
      </header>

      {categories.length > 0 && (
        <section className="vp-section vp-section--rail">
          <CategoryRail items={railItems} activeId={activeCategory} onSelect={setActiveCategory} />
        </section>
      )}

      <section className="vp-section">
        <div className="vp-section-row">
          <h2 className="vp-section-title">All shops</h2>
          <span className="vp-count">{filtered.length} shops</span>
        </div>

        {isDummy && filtered.length > 0 && <DummyBanner message="No shops have been added yet — showing sample shops so you can see how this page works." />}

        <div className="vp-grid">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ShopCardSkeleton key={i} />)
          ) : isError ? (
            <EmptyState
              icon={AlertTriangleIcon}
              title="Couldn't load shops"
              message={getErrorMessage(error)}
              action={
                <button className="vp-empty-cta" onClick={() => refetch()}>
                  Try again
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={BasketIcon} title="No shops found" message="Try a different search or category." />
          ) : (
            filtered.map((shop) => <ShopCard key={shop.id} shop={shop} />)
          )}
        </div>
      </section>
    </main>
  );
}
