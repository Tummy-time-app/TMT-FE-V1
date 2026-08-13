"use client";

import { Heart, HeartSolid } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useAddFavoriteMutation, useGetFavoritesQuery, useRemoveFavoriteMutation } from "@/features/favorites/favoritesApi";
import { cn } from "@/lib/utils/cn";

interface FavoriteButtonProps {
  vendorId: string;
  /** Overlaid on a card image vs. inline with text (RestaurantClient's "Save" action) — same toggle, two looks. */
  variant?: "overlay" | "inline";
  className?: string;
}

/** Renders nothing for a signed-out visitor — there's no wishlist without an account, and prompting mid-browse is more friction than it's worth here. */
export function FavoriteButton({ vendorId, variant = "overlay", className }: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { data: favorites } = useGetFavoritesQuery(user?.id ?? "", { skip: !user });
  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  if (!isAuthenticated || !user) return null;

  const isFavorited = favorites?.some((f) => f.vendorId === vendorId) ?? false;
  const isBusy = isAdding || isRemoving;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBusy) return;
    if (isFavorited) {
      removeFavorite({ userId: user.id, vendorId });
    } else {
      addFavorite({ userId: user.id, vendorId });
    }
  };

  if (variant === "inline") {
    return (
      <button type="button" onClick={handleClick} disabled={isBusy} className={className}>
        {isFavorited ? <HeartSolid size={14} aria-hidden style={{ verticalAlign: -2, color: "var(--crimson)" }} /> : <Heart size={14} aria-hidden style={{ verticalAlign: -2 }} />}
        {" "}
        {isFavorited ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={isFavorited}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-60",
        className
      )}
    >
      {isFavorited ? <HeartSolid size={15} aria-hidden /> : <Heart size={15} aria-hidden />}
    </button>
  );
}
