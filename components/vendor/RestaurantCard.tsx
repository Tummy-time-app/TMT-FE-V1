import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/features/restaurants/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="vc-rating">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--amber)" aria-hidden>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{rating.toFixed(1)}</span>
    </span>
  );
}

/**
 * Adapted from the `frontend` branch's components/VendorCard.tsx — real
 * TMT-BE-V1 data only. Dropped: delivery time/fee chips, min-order chip,
 * price-range ($$$), review count, "New"/promo badges — none of that
 * exists on the real Restaurant type (see features/restaurants/types.ts),
 * and faking it would contradict what's shown here being real.
 */
export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const rating = Number(restaurant.rating ?? 0);

  return (
    <Link
      href={`/vendors/restaurants/${restaurant.id}`}
      className={`vc-card ${!restaurant.isOpen ? "vc-card--closed" : ""}`}
    >
      <div className="vc-img-wrap">
        <div className="vc-img vc-img--placeholder">
          {restaurant.imageUrl && (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="vc-img"
            />
          )}
        </div>

        {!restaurant.isOpen && (
          <div className="vc-closed-overlay">
            <span>Closed</span>
          </div>
        )}
      </div>

      <div className="vc-body">
        <div className="vc-row vc-row--space">
          <p className="vc-name">{restaurant.name}</p>
          {rating > 0 && (
            <div className="vc-rating-wrap">
              <StarRating rating={rating} />
            </div>
          )}
        </div>

        <div className="vc-row vc-row--space">
          <p className="vc-cuisine">{restaurant.cuisine || "Restaurant"}</p>
        </div>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="vc-card vc-card--skeleton" aria-hidden>
      <div className="vc-img vc-skel" />
      <div className="vc-body">
        <div className="vc-skel vc-skel--title" />
        <div className="vc-skel vc-skel--sub" />
      </div>
    </div>
  );
}
