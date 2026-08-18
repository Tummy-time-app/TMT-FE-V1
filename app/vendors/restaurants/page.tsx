"use client";

import VendorFilters, {
  useVendorFilters,
} from "@/components/vendor/VendorFilters";
import VendorsGrid from "@/components/vendor/VendorsGrid";

function Header() {
  const { filteredCount } = useVendorFilters();

  return (
    <header className="vp-header">
      <div>
        <h1 className="vp-title">Restaurants</h1>
        <p className="vp-subtitle">
          {filteredCount} place{filteredCount !== 1 ? "s" : ""} near you
        </p>
      </div>

      <VendorFilters.Search />
      <VendorFilters.Button />
    </header>
  );
}

export default function VendorsPage() {
  return (
    <main className="vp-root">
      <VendorFilters>
        <Header />

        <VendorFilters.Drawer />

        <VendorFilters.Categories />

        <VendorFilters.SortBar />

        <VendorsGrid />
      </VendorFilters>
    </main>
  );
}
