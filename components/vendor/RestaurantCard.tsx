import Link from "next/link";
import type { Restaurant } from "@/features/restaurants/types";
import { getRestaurantDisplayMeta } from "@/lib/storefront/displayMeta";
import { useFavorites } from "@/lib/useFavorites";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyStrip } from "@/components/ui/DummyStrip";
import { ClockIcon, DeliveryIcon, HeartIcon } from "@/components/icons";

/**
 * Adapted from the `frontend` branch's components/VendorCard.tsx. That
 * source card had delivery time/fee chips, min-order, price range, review
 * count, and New/promo badges built and styled (see app/vendors-listing.css's
 * .vc-badges/.vc-meta/.vc-chip/.vc-price/.vc-review-count rules) — an
 * earlier pass here dropped all of it since none of those fields existed
 * on the real Restaurant type and faking it would've misrepresented real
 * data as real. Restored on explicit direction to build an
 * industry-standard storefront with placeholders where the backend
 * doesn't have fields yet — see lib/storefront/displayMeta.ts.
 *
 * "TummyTime 2.0" redesign: real Rating/icon primitives replace the
 * inline star SVG and emoji, plus a real favorite button (lib/
 * useFavorites.ts) overlaid on the image — pulled out of the <Link> as a
 * sibling button rather than nesting a <button> inside an <a>.
 */
export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const rating = Number(restaurant.rating ?? 0);
  const meta = getRestaurantDisplayMeta(restaurant);
  const priceStr = "₦".repeat(meta.priceRange);
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(restaurant.id);

  return (
    <div className={`vc-card ${!restaurant.isOpen ? "vc-card--closed" : ""}`}>
      <Link href={`/vendors/restaurants/${restaurant.id}`} className="vc-card__link">
        <div className="vc-img-wrap">
          {isDummyId(restaurant.id) && <DummyStrip />}
          <div className="vc-img vc-img--placeholder">
            <SafeImage
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="vc-img"
            />
          </div>

          <div className="vc-badges">
            {meta.isNew && <span className="vc-badge vc-badge--new">New</span>}
            {meta.promoLabel && <span className="vc-badge vc-badge--promo">{meta.promoLabel}</span>}
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
            {rating > 0 && <Rating value={rating} count={meta.reviewCount} size="sm" />}
          </div>

          <div className="vc-row vc-row--space">
            <p className="vc-cuisine">{restaurant.cuisine || "Restaurant"}</p>
            <span className="vc-price">{priceStr}</span>
          </div>

          <div className="vc-meta">
            <span className="vc-chip">
              <ClockIcon width={13} height={13} aria-hidden />
              {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 10} mins
            </span>

            <span className="vc-chip">
              <DeliveryIcon width={13} height={13} aria-hidden />
              {meta.deliveryFeeNaira === 0 ? (
                <>
                  <span className="vc-chip-free">Free</span> delivery
                </>
              ) : (
                <>₦{meta.deliveryFeeNaira.toLocaleString()} delivery</>
              )}
            </span>

            <span className="vc-chip vc-chip--muted">Min ₦{meta.minimumOrderNaira.toLocaleString()}</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className={`vc-favorite ${saved ? "vc-favorite--active" : ""}`}
        onClick={() => toggle(restaurant.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${restaurant.name} from favorites` : `Save ${restaurant.name}`}
      >
        <HeartIcon />
      </button>
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="vc-card vc-card--skeleton" aria-hidden>
      <Skeleton style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 0 }} />
      <div className="vc-body">
        <Skeleton style={{ width: "60%", height: 14, marginBottom: 8 }} />
        <Skeleton style={{ width: "40%", height: 11, marginBottom: 12 }} />
        <div className="vc-meta">
          <Skeleton style={{ width: 72, height: 22, borderRadius: 999 }} />
          <Skeleton style={{ width: 72, height: 22, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
