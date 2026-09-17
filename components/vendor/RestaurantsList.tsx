"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";
import { getErrorMessage } from "@/lib/utils/apiError";
import { getRestaurantDisplayMeta } from "@/lib/storefront/displayMeta";
import { useProfile } from "@/lib/ProfileContext";
import { DUMMY_RESTAURANTS } from "@/lib/dummy/restaurants.dummy";
import { EmptyState } from "@/components/ui/EmptyState";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { Sheet } from "@/components/ui/Sheet";
import { CategoryRail, type CategoryRailItem } from "@/components/marketplace/CategoryRail";
import {
  AlertTriangleIcon,
  BasketIcon,
  BurgerIcon,
  CakeIcon,
  FilterIcon,
  MugIcon,
  NoodleBowlIcon,
  PizzaIcon,
  SearchIcon,
  StarIcon,
  StoreIcon,
  ToastIcon,
  UtensilsIcon,
  CloseIcon,
  type IconComponent,
} from "@/components/icons";
import { RestaurantCard, RestaurantCardSkeleton } from "./RestaurantCard";

const SORT_OPTIONS = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const PAGE_SIZE = 6;

const CUISINE_ICON_MAP: [string, IconComponent][] = [
  ["fast food", BurgerIcon],
  ["burger", BurgerIcon],
  ["pizza", PizzaIcon],
  ["italian", PizzaIcon],
  ["asian", NoodleBowlIcon],
  ["breakfast", ToastIcon],
  ["dessert", CakeIcon],
  ["drink", MugIcon],
];

function iconForCuisine(cuisine: string): IconComponent {
  const key = cuisine.toLowerCase();
  return CUISINE_ICON_MAP.find(([term]) => key.includes(term))?.[1] ?? UtensilsIcon;
}

interface Filters {
  maxDeliveryMinutes: number | null;
  freeDeliveryOnly: boolean;
  minRating: number | null;
  maxPriceRange: 1 | 2 | 3 | null;
  offersOnly: boolean;
  openNow: boolean;
}

const EMPTY_FILTERS: Filters = {
  maxDeliveryMinutes: null,
  freeDeliveryOnly: false,
  minRating: null,
  maxPriceRange: null,
  offersOnly: false,
  openNow: false,
};

function countActiveFilters(f: Filters): number {
  return Object.values(f).filter((v) => v !== null && v !== false).length;
}

/**
 * Adapted from the `frontend` branch's app/vendors/restaurants/page.tsx +
 * components/vendor/{VendorFilters,VendorsGrid}.tsx. Real TMT-BE-V1 data
 * via restaurantsApi (useListRestaurantsQuery) instead of the source's
 * static lib/vendordata.ts mock array.
 *
 * "TummyTime 2.0" marketplace redesign: the header is now a real
 * discovery intro ("Discover your next meal" + the customer's own
 * delivery location, read from the same ProfileContext the map/address
 * picker writes to — see components/nav/Navigation.tsx's "Deliver to"),
 * the cuisine rail uses the shared CategoryRail primitive with real icons
 * instead of a single 🍽️ emoji, and "Filter" opens an actual sheet with
 * six real filters (rating/delivery time/delivery fee/price/offers/open
 * now) computed from lib/storefront/displayMeta.ts's placeholder fields,
 * replacing the single inline "Open now" toggle. Cuisine itself isn't
 * duplicated into the filter sheet — the rail above already does that job.
 *
 * Reused for Groceries/Shops/Markets (marketplace-expansion plan's Phase
 * C): those are just this same restaurants list filtered server-side by
 * `businessType`, with copy overrides — there's no separate product/shop
 * concept anywhere in TMT-BE-V1, so a "grocery" or a "market stall" is a
 * `restaurants` row like any other, browsed and ordered from the exact
 * same product-detail-modal flow.
 */
interface RestaurantsListProps {
  /** Comma-separated restaurant-service businessType filter, e.g. "grocery" or "retail,other". Omit for the default all-restaurants view. */
  businessType?: string;
  /** Client-side filter to one named market's stalls (matches Restaurant.businessCategory exactly) — see app/vendors/markets/[marketName]/page.tsx. */
  businessCategory?: string;
  heading?: string;
  /**
   * Header subtitle, with `{location}` substituted for the customer's
   * delivery-location label. A plain string, not a function — this
   * component is rendered from server-component pages (app/groceries/
   * page.tsx etc.), which can't pass closures across the RSC boundary.
   */
  subtitle?: string;
  /** Singular noun used for "{count} {noun}s" copy and empty states — defaults to "restaurant". */
  noun?: string;
  searchPlaceholder?: string;
  /**
   * A key into EMPTY_ICON_MAP rather than an IconComponent reference —
   * this component is rendered from server-component pages (app/groceries/
   * page.tsx etc.), which can't pass a function/component reference across
   * the RSC boundary.
   */
  emptyIconKey?: "utensils" | "store" | "basket";
}

const EMPTY_ICON_MAP: Record<NonNullable<RestaurantsListProps["emptyIconKey"]>, IconComponent> = {
  utensils: UtensilsIcon,
  store: StoreIcon,
  basket: BasketIcon,
};

export function RestaurantsList({
  businessType,
  businessCategory,
  heading = "Discover your next meal",
  subtitle = "Great food around {location}",
  noun = "restaurant",
  searchPlaceholder = "Search restaurants or cuisines…",
  emptyIconKey = "utensils",
}: RestaurantsListProps = {}) {
  const { data: restaurants = [], isLoading, isError, error, refetch } = useListRestaurantsQuery(
    businessType ? { businessType } : undefined,
  );
  const { profile } = useProfile();

  // Only when the query genuinely succeeded with nothing — never on
  // loading or error, which already have their own states below. Skipped
  // entirely for businessType-filtered views (Shops/Groceries/Markets):
  // DUMMY_RESTAURANTS is restaurant-flavored sample data and would be
  // actively misleading shown on those pages, so an empty result there
  // just renders the genuine "nothing found" empty state instead.
  const isDummy = !businessType && !isLoading && !isError && restaurants.length === 0;
  const sourceRestaurants = useMemo(() => {
    const base = isDummy ? DUMMY_RESTAURANTS : restaurants;
    return businessCategory ? base.filter((r) => r.businessCategory === businessCategory) : base;
  }, [isDummy, restaurants, businessCategory]);

  // Seeds from ?q=... when arriving via the nav search bar (components/nav/
  // Navigation.tsx) — a plain useState initializer, not a synced effect, so
  // typing in the box afterward doesn't fight the URL. Reading
  // useSearchParams() requires this page to be wrapped in <Suspense> — see
  // app/vendors/restaurants/page.tsx.
  const initialQuery = useSearchParams().get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const locationLabel = profile.address.line1 || profile.address.city || "you";

  const cuisines = useMemo(() => {
    const set = new Set(sourceRestaurants.map((r) => r.cuisine).filter((c): c is string => Boolean(c)));
    return Array.from(set);
  }, [sourceRestaurants]);

  const railItems: CategoryRailItem[] = useMemo(
    () => [
      { id: "all", label: "All", icon: UtensilsIcon },
      ...cuisines.map((c) => ({ id: c, label: c, icon: iconForCuisine(c) })),
    ],
    [cuisines],
  );

  const filtered = useMemo(() => {
    let list = [...sourceRestaurants];

    if (activeCuisine !== "all") list = list.filter((r) => r.cuisine === activeCuisine);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || (r.cuisine ?? "").toLowerCase().includes(q));
    }

    if (filters.openNow) list = list.filter((r) => r.isOpen);

    if (filters.minRating != null) {
      const min = filters.minRating;
      list = list.filter((r) => Number(r.rating ?? 0) >= min);
    }

    if (filters.maxDeliveryMinutes != null || filters.freeDeliveryOnly || filters.maxPriceRange != null || filters.offersOnly) {
      list = list.filter((r) => {
        const meta = getRestaurantDisplayMeta(r);
        if (filters.maxDeliveryMinutes != null && meta.deliveryEtaMinutes > filters.maxDeliveryMinutes) return false;
        if (filters.freeDeliveryOnly && meta.deliveryFeeNaira !== 0) return false;
        if (filters.maxPriceRange != null && meta.priceRange > filters.maxPriceRange) return false;
        if (filters.offersOnly && !meta.promoLabel) return false;
        return true;
      });
    }

    if (sortKey === "rating") {
      list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    }

    return list;
  }, [sourceRestaurants, activeCuisine, search, filters, sortKey]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;
  const activeFilterCount = countActiveFilters(filters);

  const resetFilters = () => {
    setSearch("");
    setActiveCuisine("all");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">{heading}</h1>
          <p className="vp-subtitle">{subtitle.replace("{location}", locationLabel)}</p>
        </div>

        <div className="vp-search-wrap">
          <SearchIcon className="vp-search-icon" />
          <input
            type="text"
            className="vp-search-input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label={`Search ${noun}s`}
          />
          {search && (
            <button className="vp-search-clear" onClick={() => setSearch("")} aria-label="Clear">
              <CloseIcon width={12} height={12} />
            </button>
          )}
        </div>

        <button
          className={`vp-filter-btn ${activeFilterCount > 0 ? "vp-filter-btn--active" : ""}`}
          onClick={() => setFilterOpen(true)}
          aria-expanded={filterOpen}
          aria-label="Open filters"
        >
          <FilterIcon width={15} height={15} />
          Filter
          {activeFilterCount > 0 && <span className="vp-filter-count">{activeFilterCount}</span>}
        </button>
      </header>

      {cuisines.length > 0 && (
        <section className="vp-section vp-section--rail">
          <CategoryRail
            items={railItems}
            activeId={activeCuisine}
            onSelect={(id) => {
              setActiveCuisine(id);
              setPage(1);
            }}
          />
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
          <h2 className="vp-section-title">All {noun}s</h2>
          <span className="vp-count">{filtered.length} {noun}{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {isDummy && filtered.length > 0 && <DummyBanner message="No restaurants have been added yet — showing sample listings so you can see how this page works." />}

        <div className="vp-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : isError ? (
            <EmptyState
              icon={AlertTriangleIcon}
              title={`Couldn't load ${noun}s`}
              message={getErrorMessage(error)}
              action={
                <button className="vp-empty-cta" onClick={() => refetch()}>
                  Try again
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={EMPTY_ICON_MAP[emptyIconKey]}
              title={`No ${noun}s found`}
              message="Try adjusting your search or filters."
              action={
                <button className="vp-empty-cta" onClick={resetFilters}>
                  Clear filters
                </button>
              }
            />
          ) : (
            visible.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          )}
        </div>

        {!isLoading && !isError && hasMore && (
          <div className="vp-load-more">
            <button className="vp-load-more-btn" onClick={() => setPage((p) => p + 1)}>
              View more {noun}s
            </button>
          </div>
        )}
      </section>

      <Sheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        footer={
          <div className="vp-filter-sheet__footer">
            <button
              type="button"
              className="vp-filter-sheet__reset"
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={activeFilterCount === 0}
            >
              Reset all
            </button>
            <button type="button" className="vp-filter-sheet__apply" onClick={() => setFilterOpen(false)}>
              Show {filtered.length} {noun}{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        }
      >
        <div className="vp-filter-sheet__group">
          <p className="vp-filter-sheet__label">Rating</p>
          <div className="vp-filter-sheet__chips">
            {[4.5, 4, 3.5].map((r) => (
              <button
                key={r}
                type="button"
                className={`vp-filter-sheet__chip ${filters.minRating === r ? "vp-filter-sheet__chip--active" : ""}`}
                onClick={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? null : r }))}
              >
                {r}+ <StarIcon width={11} height={11} style={{ color: "var(--amber-500)" }} />
              </button>
            ))}
          </div>
        </div>

        <div className="vp-filter-sheet__group">
          <p className="vp-filter-sheet__label">Delivery time</p>
          <div className="vp-filter-sheet__chips">
            {[20, 30, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                className={`vp-filter-sheet__chip ${filters.maxDeliveryMinutes === mins ? "vp-filter-sheet__chip--active" : ""}`}
                onClick={() =>
                  setFilters((f) => ({ ...f, maxDeliveryMinutes: f.maxDeliveryMinutes === mins ? null : mins }))
                }
              >
                Under {mins} min
              </button>
            ))}
          </div>
        </div>

        <div className="vp-filter-sheet__group">
          <p className="vp-filter-sheet__label">Price</p>
          <div className="vp-filter-sheet__chips">
            {([1, 2, 3] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`vp-filter-sheet__chip ${filters.maxPriceRange === p ? "vp-filter-sheet__chip--active" : ""}`}
                onClick={() => setFilters((f) => ({ ...f, maxPriceRange: f.maxPriceRange === p ? null : p }))}
              >
                {"₦".repeat(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="vp-filter-sheet__group">
          <label className="vp-filter-toggle">
            <span>Free delivery</span>
            <input
              type="checkbox"
              checked={filters.freeDeliveryOnly}
              onChange={(e) => setFilters((f) => ({ ...f, freeDeliveryOnly: e.target.checked }))}
            />
            <span className="vp-toggle-track">
              <span className="vp-toggle-thumb" />
            </span>
          </label>
          <label className="vp-filter-toggle">
            <span>Offers &amp; deals</span>
            <input
              type="checkbox"
              checked={filters.offersOnly}
              onChange={(e) => setFilters((f) => ({ ...f, offersOnly: e.target.checked }))}
            />
            <span className="vp-toggle-track">
              <span className="vp-toggle-thumb" />
            </span>
          </label>
          <label className="vp-filter-toggle">
            <span>Open now</span>
            <input
              type="checkbox"
              checked={filters.openNow}
              onChange={(e) => setFilters((f) => ({ ...f, openNow: e.target.checked }))}
            />
            <span className="vp-toggle-track">
              <span className="vp-toggle-thumb" />
            </span>
          </label>
        </div>
      </Sheet>
    </main>
  );
}
