"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { SafeImage } from "@/components/ui/SafeImage";
import { getMenuItemDisplayMeta } from "@/lib/storefront/displayMeta";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { DummyStrip } from "@/components/ui/DummyStrip";
import { FlameIcon } from "@/components/icons";
import type { FoodListing } from "@/features/food/types";
import "./FoodItemCard.css";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * The food-discovery equivalent of RestaurantView.tsx's item row — same
 * popular badge, same deterministic display-meta fallback — but shaped
 * for a horizontal rail card instead of a menu list row, and carrying its
 * own restaurant name since (unlike the detail page) it isn't implied by
 * context. The add button is a sibling of the <Link>, not nested inside
 * it — same reasoning as RestaurantCard.tsx's favorite button.
 */
export function FoodItemCard({ listing }: { listing: FoodListing }) {
  const { item, restaurant } = listing;
  const { cart, addItem, changeQty } = useCart();
  const itemMeta = getMenuItemDisplayMeta(item);
  const isDummy = isDummyId(item.id) || isDummyId(restaurant.id);
  const orderable = item.available && restaurant.isOpen && !isDummy;
  const qty = cart.restaurantId === restaurant.id ? (cart.entries.find((e) => e.item.id === item.id)?.qty ?? 0) : 0;

  return (
    <div className="food-card">
      <Link href={`/vendors/restaurants/${restaurant.id}`} className="food-card__link">
        <div className="food-card__img-wrap">
          {isDummy && <DummyStrip />}
          <SafeImage src={item.imageUrl} alt={item.name} fill className="food-card__img" />
          {itemMeta.isPopular && !isDummy && (
            <span className="food-card__badge">
              <FlameIcon />
              Popular
            </span>
          )}
          {!orderable && !isDummy && <div className="food-card__unavailable">{!item.available ? "Sold out" : "Closed"}</div>}
        </div>
        <p className="food-card__name">{item.name}</p>
        <p className="food-card__restaurant">{restaurant.name}</p>
        <p className="food-card__price">{formatNaira(Number(item.price))}</p>
      </Link>

      {orderable && (
        <button
          type="button"
          className="food-card__add"
          onClick={() => (qty > 0 ? changeQty(item.id, 1) : addItem(restaurant.id, restaurant.name, item, 1))}
          aria-label={qty > 0 ? `Add another ${item.name}` : `Add ${item.name}`}
        >
          {qty > 0 ? qty : "+"}
        </button>
      )}
    </div>
  );
}
