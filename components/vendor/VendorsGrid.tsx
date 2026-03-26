import React, { useEffect, useMemo } from "react";
import { useVendorFilters } from "./VendorFilters";
import { Vendor, VENDORS } from "@/lib/vendordata";
import VendorCard from "../VendorCard";

const VendorsGrid = () => {
  const { activeCategory, sortKey, filters, search, page, setPage } =
    useVendorFilters();

  const { setFilteredCount } = useVendorFilters();

  const PAGE_SIZE = 6;

  const filtered = useMemo<Vendor[]>(() => {
    let list = [...VENDORS];

    if (activeCategory !== "all")
      list = list.filter((v) => v.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.cuisine.toLowerCase().includes(q),
      );
    }

    if (filters.freeDelivery) list = list.filter((v) => v.deliveryFee === 0);
    if (filters.openNow) list = list.filter((v) => v.isOpen);

    if (filters.maxDeliveryTime > 0)
      list = list.filter(
        (v) =>
          parseInt(v.deliveryTime.split("-")[1]) <= filters.maxDeliveryTime,
      );

    if (sortKey === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortKey === "delivery_time")
      list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    if (sortKey === "delivery_fee")
      list.sort((a, b) => a.deliveryFee - b.deliveryFee);

    return list;
  }, [activeCategory, sortKey, filters, search]);

  useEffect(() => {
    setFilteredCount(filtered.length);
  }, [filtered, setFilteredCount]);

  const featured = filtered.filter((v) => v.isFeatured);
  const allVendors = filtered.filter((v) => !v.isFeatured);

  const visibleAll = allVendors.slice(0, page * PAGE_SIZE);
  const hasMore = visibleAll.length < allVendors.length;

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

      <section className="vp-section">
        <div className="vp-section-row">
          <h2 className="vp-section-title">All restaurants</h2>
          <span className="vp-count">{allVendors.length} restaurants</span>
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
            >
              View more restaurants
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default VendorsGrid;
