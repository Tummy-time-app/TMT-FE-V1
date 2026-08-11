"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { X } from "@/components/icons";
import { useGetVendorCategoriesQuery } from "@/features/vendors/vendorsApi";

/* ───────────────────────── TYPES ───────────────────────── */

export type Filters = {
  freeDelivery: boolean;
  openNow: boolean;
  maxDeliveryTime: number;
};

type SortKey = "recommended" | "rating" | "delivery_time" | "delivery_fee";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
  { key: "delivery_time", label: "Fastest" },
  { key: "delivery_fee", label: "Lowest fee" },
];

const DEFAULT_FILTERS: Filters = {
  freeDelivery: false,
  openNow: false,
  maxDeliveryTime: 0,
};

type ContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterOpen: boolean;
  setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeFilterCount: number;

  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;

  sortKey: SortKey;
  setSortKey: React.Dispatch<React.SetStateAction<SortKey>>;

  filteredCount: number;
  setFilteredCount: React.Dispatch<React.SetStateAction<number>>;

  resetFilters: () => void;
};

/* ───────────────────────── CONTEXT ───────────────────────── */

const VendorFiltersContext = createContext<ContextType | null>(null);

export function useVendorFilters() {
  const ctx = useContext(VendorFiltersContext);

  if (!ctx) {
    throw new Error("VendorFilters must be used inside <VendorFilters>");
  }

  return ctx;
}

/* ───────────────────────── PROVIDER ───────────────────────── */

function VendorFilters({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [filteredCount, setFilteredCount] = useState(0);

  const activeFilterCount = [
    filters.freeDelivery,
    filters.openNow,
    filters.maxDeliveryTime > 0,
  ].filter(Boolean).length;

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setFilterOpen(false);
  }

  return (
    <VendorFiltersContext.Provider
      value={{
        filters,
        setFilters,
        page,
        setPage,
        filterOpen,
        setFilterOpen,
        activeFilterCount,
        search,
        setSearch,
        activeCategory,
        setActiveCategory,
        sortKey,
        setSortKey,
        filteredCount,
        setFilteredCount,
        resetFilters,
      }}
    >
      {children}
    </VendorFiltersContext.Provider>
  );
}

/* ───────────────────────── SEARCH ───────────────────────── */

VendorFilters.Search = function Search() {
  const { search, setSearch, setPage } = useVendorFilters();

  return (
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
        aria-label="Search vendors"
      />

      {search && (
        <button
          className="vp-search-clear"
          onClick={() => setSearch("")}
          aria-label="Clear"
        >
          <X size={13} aria-hidden />
        </button>
      )}
    </div>
  );
};

/* ───────────────────────── FILTER BUTTON ───────────────────────── */

VendorFilters.Button = function Button() {
  const { filterOpen, setFilterOpen, activeFilterCount } = useVendorFilters();

  return (
    <button
      className={`vp-filter-btn ${
        activeFilterCount > 0 ? "vp-filter-btn--active" : ""
      }`}
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
      {activeFilterCount > 0 && (
        <span className="vp-filter-count">{activeFilterCount}</span>
      )}
    </button>
  );
};

/* ───────────────────────── FILTER DRAWER ───────────────────────── */

VendorFilters.Drawer = function Drawer() {
  const { filters, setFilters, filterOpen, resetFilters } = useVendorFilters();

  if (!filterOpen) return null;

  return (
    <div className="vp-filter-panel">
      <div className="vp-filter-header">
        <p className="vp-filter-title">Filters</p>
        <button className="vp-filter-reset" onClick={resetFilters}>
          Reset all
        </button>
      </div>

      <div className="vp-filter-body">
        {/* toggles */}
        <label className="vp-filter-toggle">
          <span>Open now</span>
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) =>
              setFilters((f) => ({ ...f, openNow: e.target.checked }))
            }
          />
          <span className="vp-toggle-track">
            <span className="vp-toggle-thumb" />
          </span>
        </label>

        <label className="vp-filter-toggle">
          <span>Free delivery</span>
          <input
            type="checkbox"
            checked={filters.freeDelivery}
            onChange={(e) =>
              setFilters((f) => ({ ...f, freeDelivery: e.target.checked }))
            }
          />
          <span className="vp-toggle-track">
            <span className="vp-toggle-thumb" />
          </span>
        </label>

        {/* delivery time slider */}
        <div className="vp-filter-field">
          <p className="vp-filter-field-label">
            Max delivery time
            <em>
              {filters.maxDeliveryTime > 0
                ? ` — ${filters.maxDeliveryTime} mins`
                : " — Any"}
            </em>
          </p>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={filters.maxDeliveryTime}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                maxDeliveryTime: Number(e.target.value),
              }))
            }
            className="vp-range"
          />
          <div className="vp-range-labels">
            <span>Any</span>
            <span>60 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── CATEGORIES ───────────────────────── */

VendorFilters.Categories = function Categories() {
  const { activeCategory, setActiveCategory, setPage } = useVendorFilters();
  const { data: categories, isLoading } = useGetVendorCategoriesQuery();

  return (
    <section className="vp-section">
      <h2 className="vp-section-title">Explore categories</h2>
      <div className="vp-categories" role="list">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="vc-skel" style={{ width: 88, height: 78, borderRadius: 16, flexShrink: 0 }} aria-hidden />
            ))
          : categories?.map((cat) => (
              <button
                key={cat.id}
                role="listitem"
                className={`vp-cat-btn ${
                  activeCategory === cat.id ? "vp-cat-btn--active" : ""
                }`}
                style={{
                  background: activeCategory === cat.id ? cat.gradient : undefined,
                }}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setPage(1);
                }}
              >
                <span className="vp-cat-emoji"><cat.icon size={26} aria-hidden /></span>
                <span className="vp-cat-label">{cat.label}</span>
              </button>
            ))}
      </div>
    </section>
  );
};

/* ───────────────────────── SORT BAR ───────────────────────── */

VendorFilters.SortBar = function SortBar() {
  const { sortKey, setSortKey } = useVendorFilters();

  return (
    <div className="vp-sort-bar">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          className={`vp-sort-chip ${
            sortKey === opt.key ? "vp-sort-chip--active" : ""
          }`}
          onClick={() => setSortKey(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default VendorFilters;
