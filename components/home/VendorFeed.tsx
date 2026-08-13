"use client";

import { useMemo } from "react";
import { useGetVendorsQuery, useGetVendorCategoriesQuery } from "@/features/vendors/vendorsApi";
import { VendorCarousel } from "./VendorCarousel";
import VendorCard from "@/components/VendorCard";

// Large enough to pull the whole approved-vendor set in one request in
// dev/mock mode; against the real API this is just the first feed page.
const FEED_PAGE_SIZE = 30;

/**
 * The homepage discovery feed — Uber Eats' actual homepage isn't a static
 * marketing layout, it's this: a "Popular near you" row up top, then one
 * horizontally-scrolling row per cuisine. Replaces the old static
 * "Restaurants / Shops / Local Markets" feature-card grid, which never
 * showed a single real vendor.
 */
export function VendorFeed() {
  const { data, isLoading, error } = useGetVendorsQuery({
    category: "all",
    sort: "recommended",
    pageSize: FEED_PAGE_SIZE,
  });
  const { data: categories } = useGetVendorCategoriesQuery();

  const grouped = useMemo(() => {
    if (!data) return [];
    const byCategory = new Map<string, typeof data.vendors>();
    for (const v of data.vendors) {
      const list = byCategory.get(v.category) ?? [];
      list.push(v);
      byCategory.set(v.category, list);
    }
    // Preserve display order from the categories list itself, not insertion order.
    return (categories ?? [])
      .filter((c) => c.id !== "all")
      .map((c) => ({ id: c.id, label: c.label, vendors: byCategory.get(c.id) ?? [] }))
      .filter((g) => g.vendors.length > 0);
  }, [data, categories]);

  if (isLoading) {
    return (
      <div className="hf-feed">
        {Array.from({ length: 2 }).map((_, i) => (
          <section key={i} className="hf-carousel-section" aria-hidden>
            <div className="hf-skel-title" />
            <div className="hf-carousel-track">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="hf-carousel-card">
                  <VendorCard skeleton />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Feed sections quietly disappear on error rather than showing an
  // error block — same "never leave an empty gap, never block the rest
  // of the page" contract BannerStrip already uses for this homepage.
  if (error || !data) return null;

  const { featured } = data;
  if (featured.length === 0 && grouped.length === 0) return null;

  return (
    <div className="hf-feed">
      {featured.length > 0 && (
        <VendorCarousel title="Popular near you" vendors={featured} seeAllHref="/vendors/restaurants" />
      )}
      {grouped.map((g) => (
        <VendorCarousel
          key={g.id}
          title={`${g.label} near you`}
          vendors={g.vendors}
          seeAllHref={`/vendors/restaurants?category=${g.id}`}
        />
      ))}
    </div>
  );
}
