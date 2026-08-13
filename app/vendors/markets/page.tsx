"use client";

import { Suspense } from "react";
import VendorFilters, {
  useVendorFilters,
} from "@/components/vendor/VendorFilters";
import VendorsGrid from "@/components/vendor/VendorsGrid";

function Header() {
  const { filteredCount } = useVendorFilters();

  return (
    <header className="vp-header">
      <div>
        <h1 className="vp-title">Local Markets</h1>
        <p className="vp-subtitle">
          {filteredCount} market{filteredCount !== 1 ? "s" : ""} near you
        </p>
      </div>

      <VendorFilters.Search />
      <VendorFilters.Button />
    </header>
  );
}

function MarketsPageContent() {
  return (
    <VendorFilters businessType="market">
      <Header />

      <VendorFilters.Drawer />

      <VendorFilters.Categories />

      <VendorFilters.SortBar />

      <VendorsGrid />
    </VendorFilters>
  );
}

export default function MarketsPage() {
  return (
    <main className="vp-root">
      <Suspense fallback={null}>
        <MarketsPageContent />
      </Suspense>
    </main>
  );
}
