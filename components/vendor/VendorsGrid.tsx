import React, { useEffect } from "react";
import { useVendorFilters } from "./VendorFilters";
import { useGetVendorsQuery } from "@/features/vendors/vendorsApi";
import VendorCard from "../VendorCard";
import { ErrorState } from "@/components/feedback/ErrorState";

const PAGE_SIZE = 6;

const VendorsGrid = () => {
  const { activeCategory, sortKey, filters, search, page, setPage, resetFilters, setFilteredCount } =
    useVendorFilters();

  const { data, isLoading, isFetching, error, refetch } = useGetVendorsQuery({
    category: activeCategory,
    search,
    sort: sortKey,
    freeDelivery: filters.freeDelivery,
    openNow: filters.openNow,
    maxDeliveryTime: filters.maxDeliveryTime,
    page,
    pageSize: PAGE_SIZE,
  });

  const featured = data?.featured ?? [];
  const visibleAll = data?.vendors ?? [];
  const total = data?.total ?? 0;
  const hasMore = visibleAll.length < total;
  const isPaginating = isFetching && page > 1;

  useEffect(() => {
    setFilteredCount(featured.length + total);
  }, [featured.length, total, setFilteredCount]);

  if (isLoading) {
    return (
      <section className="vp-section">
        <div className="vp-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <VendorCard key={i} skeleton />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (featured.length === 0 && visibleAll.length === 0) {
    return (
      <div className="vp-empty">
        <div className="vp-empty-icon">🍽️</div>
        <p className="vp-empty-title">No restaurants found</p>
        <p className="vp-empty-sub">Try a different search term or clear your filters.</p>
        <button className="vp-empty-cta" onClick={resetFilters}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <>
      {featured.length > 0 && (
        <section className="vp-section">
          <h2 className="vp-section-title">
            Handpicked for you <span>🤍</span>
          </h2>

          <div className="vp-grid">
            {featured.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </section>
      )}

      {visibleAll.length > 0 && (
        <section className="vp-section">
          <div className="vp-section-row">
            <h2 className="vp-section-title">All restaurants</h2>
            <span className="vp-count">{total} restaurants</span>
          </div>

          <div className="vp-grid">
            {visibleAll.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>

          {hasMore && (
            <div className="vp-load-more">
              <button
                className="vp-load-more-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={isPaginating}
              >
                {isPaginating ? "Loading…" : "View more restaurants"}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default VendorsGrid;
