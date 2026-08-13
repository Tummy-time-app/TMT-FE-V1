"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetFavoritesQuery } from "@/features/favorites/favoritesApi";
import { useGetVendorsQuery } from "@/features/vendors/vendorsApi";
import VendorCard from "@/components/VendorCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Heart } from "@/components/icons";

function FavoritesContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: favorites, isLoading: favoritesLoading } = useGetFavoritesQuery(userId, { skip: !userId });
  // Favorites are just vendor ids — pull the full catalog once and filter client-side rather than adding a bulk-fetch-by-ids endpoint just for this.
  const { data: vendorsResponse, isLoading: vendorsLoading } = useGetVendorsQuery({ pageSize: 100 });

  const isLoading = favoritesLoading || vendorsLoading;
  const allVendors = [...(vendorsResponse?.featured ?? []), ...(vendorsResponse?.vendors ?? [])];
  const favoriteVendors = favorites
    ? allVendors.filter((v) => favorites.some((f) => f.vendorId === v.id))
    : [];

  return (
    <main className="vp-root">
      <header className="vp-header">
        <div>
          <h1 className="vp-title">Favorites</h1>
          <p className="vp-subtitle">
            {favoriteVendors.length} saved place{favoriteVendors.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="vp-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <VendorCard key={i} skeleton />
          ))}
        </div>
      ) : favoriteVendors.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any restaurant, shop, or market to save it here."
        />
      ) : (
        <div className="vp-grid">
          {favoriteVendors.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
