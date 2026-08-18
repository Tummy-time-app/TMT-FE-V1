"use client";

import { useMemo, useState } from "react";
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";
import { RestaurantCard, RestaurantCardSkeleton } from "./RestaurantCard";

const SORT_OPTIONS = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const PAGE_SIZE = 6;

/**
 * Adapted from the `frontend` branch's app/vendors/restaurants/page.tsx +
 * components/vendor/{VendorFilters,VendorsGrid}.tsx. Real TMT-BE-V1 data
 * via restaurantsApi (useListRestaurantsQuery) instead of the source's
 * static lib/vendordata.ts mock array.
 *
 * The source's Context-based compound-component pattern (VendorFilters +
 * subcomponents) is collapsed into one component with local state — this
 * page is the only consumer, so the extra indirection wasn't buying
 * anything once the fake-data-only pieces below were dropped:
 *  - "Free delivery" toggle and the max-delivery-time slider (no
 *    deliveryFee/deliveryTime field on the real Restaurant type)
 *  - "Fastest"/"Lowest fee" sort options (same reason)
 *  - the fixed 8-item category taxonomy (Pizza/Drinks/Soups/...) — real
 *    ones are derived from whatever cuisines actually exist in the data
 *  - the "Handpicked for you" featured section (no isFeatured field)
 */
export function RestaurantsList() {
  const { data: restaurants = [], isLoading, isError } = useListRestaurantsQuery();

  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [openNow, setOpenNow] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const cuisines = useMemo(() => {
    const set = new Set(
      restaurants.map((r) => r.cuisine).filter((c): c is string => Boolean(c)),
    );
    return Array.from(set);
  }, [restaurants]);

  const filtered = useMemo(() => {
    let list = [...restaurants];

    if (activeCuisine !== "all") list = list.filter((r) => r.cuisine === activeCuisine);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.cuisine ?? "").toLowerCase().includes(q),
      );
    }

    if (openNow) list = list.filter((r) => r.isOpen);

    if (sortKey === "rating") {
      list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    }

    return list;
  }, [restaurants, activeCuisine, search, openNow, sortKey]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;
  const activeFilterCount = openNow ? 1 : 0;

  const resetFilters = () => {
    setSearch("");
    setActiveCuisine("all");
    setOpenNow(false);
    setFilterOpen(false);
    setPage(1);
  };

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">Restaurants</h1>
          <p className="vp-subtitle">
            {filtered.length} place{filtered.length !== 1 ? "s" : ""} near you
          </p>
        </div>

        <div className="vp-search-wrap">
          <svg
            className="vp-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="vp-search-input"
            placeholder="Search restaurants or cuisines…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search restaurants"
          />
          {search && (
            <button className="vp-search-clear" onClick={() => setSearch("")} aria-label="Clear">
              ✕
            </button>
          )}
        </div>

        <button
          className={`vp-filter-btn ${activeFilterCount > 0 ? "vp-filter-btn--active" : ""}`}
          onClick={() => setFilterOpen((p) => !p)}
          aria-expanded={filterOpen}
          aria-label="Open filters"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filter
          {activeFilterCount > 0 && <span className="vp-filter-count">{activeFilterCount}</span>}
        </button>
      </header>

      {filterOpen && (
        <div className="vp-filter-panel">
          <div className="vp-filter-header">
            <p className="vp-filter-title">Filters</p>
            <button className="vp-filter-reset" onClick={() => setOpenNow(false)}>
              Reset all
            </button>
          </div>

          <div className="vp-filter-body">
            <label className="vp-filter-toggle">
              <span>Open now</span>
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
              />
              <span className="vp-toggle-track">
                <span className="vp-toggle-thumb" />
              </span>
            </label>
          </div>
        </div>
      )}

      {cuisines.length > 0 && (
        <section className="vp-section">
          <h2 className="vp-section-title">Explore cuisines</h2>
          <div className="vp-categories" role="list">
            <button
              role="listitem"
              className={`vp-cat-btn ${activeCuisine === "all" ? "vp-cat-btn--active" : ""}`}
              onClick={() => {
                setActiveCuisine("all");
                setPage(1);
              }}
            >
              <span className="vp-cat-emoji">🍽️</span>
              <span className="vp-cat-label">All</span>
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                role="listitem"
                className={`vp-cat-btn ${activeCuisine === cuisine ? "vp-cat-btn--active" : ""}`}
                onClick={() => {
                  setActiveCuisine(cuisine);
                  setPage(1);
                }}
              >
                <span className="vp-cat-label">{cuisine}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="vp-sort-bar">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`vp-sort-chip ${sortKey === opt.key ? "vp-sort-chip--active" : ""}`}
            onClick={() => setSortKey(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <section className="vp-section">
        <div className="vp-section-row">
          <h2 className="vp-section-title">All restaurants</h2>
          <span className="vp-count">{filtered.length} restaurants</span>
        </div>

        <div className="vp-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : isError ? (
            <div className="vp-empty">
              <div className="vp-empty-icon">⚠️</div>
              <p className="vp-empty-title">Couldn&apos;t load restaurants</p>
              <p className="vp-empty-sub">Please check your connection and try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="vp-empty">
              <div className="vp-empty-icon">🍽️</div>
              <p className="vp-empty-title">No restaurants found</p>
              <p className="vp-empty-sub">Try adjusting your search or filters.</p>
              <button className="vp-empty-cta" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            visible.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          )}
        </div>

        {!isLoading && !isError && hasMore && (
          <div className="vp-load-more">
            <button className="vp-load-more-btn" onClick={() => setPage((p) => p + 1)}>
              View more restaurants
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
