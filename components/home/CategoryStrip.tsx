"use client";

import Link from "next/link";
import { useGetVendorCategoriesQuery } from "@/features/vendors/vendorsApi";
import type { VendorBusinessType } from "@/features/vendors/types";

const LISTING_ROUTE: Record<VendorBusinessType, string> = {
  restaurant: "/vendors/restaurants",
  shop: "/vendors/shops",
  market: "/vendors/markets",
};

interface Props {
  businessType?: VendorBusinessType;
}

/**
 * Horizontal row of circular category icons under the homepage hero —
 * Uber Eats' own homepage leads with exactly this (a scrollable icon
 * strip: Pizza, Burgers, Sushi…) as the fastest path into the feed.
 * Each icon deep-links into the matching listing page pre-filtered to
 * that category (see VendorFilters' ?category= read).
 */
export function CategoryStrip({ businessType = "restaurant" }: Props) {
  const { data: categories, isLoading } = useGetVendorCategoriesQuery(businessType);
  const list = (categories ?? []).filter((c) => c.id !== "all");
  const listingRoute = LISTING_ROUTE[businessType];

  return (
    <section className="hf-catstrip-section" aria-label="Browse by category">
      <div className="hf-catstrip">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="hf-catstrip-item hf-catstrip-item--skel" aria-hidden>
                <span className="hf-catstrip-icon hf-catstrip-icon--skel" />
                <span className="hf-catstrip-label-skel" />
              </div>
            ))
          : list.map((cat) => (
              <Link
                key={cat.id}
                href={`${listingRoute}?category=${cat.id}`}
                className="hf-catstrip-item"
              >
                <span className="hf-catstrip-icon" style={{ background: cat.gradient }}>
                  <cat.icon size={24} aria-hidden />
                </span>
                <span className="hf-catstrip-label">{cat.label}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
