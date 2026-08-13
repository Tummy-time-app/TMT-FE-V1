"use client";
import Link from "next/link";
import type { Vendor } from "@/features/vendors/types";
import Image from "next/image";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="vc-rating">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="var(--amber)"
        aria-hidden
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{rating.toFixed(1)}</span>
    </span>
  );
}

type Props =
  | { vendor: Vendor; skeleton?: false }
  | { skeleton: true; vendor?: undefined };

export default function VendorCard({ vendor, skeleton }: Props) {
  /* ── Skeleton ─────────────────────────────────────────── */
  if (skeleton) {
    return (
      <div className="vc-card vc-card--skeleton" aria-hidden>
        <div className="vc-img vc-skel" />
        <div className="vc-body">
          <div className="vc-skel vc-skel--title" />
          <div className="vc-skel vc-skel--sub" />
          <div className="vc-meta">
            <div className="vc-skel vc-skel--chip" />
            <div className="vc-skel vc-skel--chip" />
          </div>
        </div>
      </div>
    );
  }

  const {
    id,
    name,
    cuisine,
    rating,
    reviewCount,
    deliveryTime,
    deliveryFee,
    minOrder,
    priceRange,
    isOpen,
    isNew,
    promoLabel,
    image,
  } = vendor!;

  const priceStr = Array.from({ length: priceRange }, () => "₦").join("");

  return (
    <Link
      href={`/vendors/restaurants/${id}`}
      className={`vc-card ${!isOpen ? "vc-card--closed" : ""}`}
    >
      {/* ── image area ── */}
      <div className="vc-img-wrap">
        {/* placeholder gradient — swap with next/image when you have real images */}

        <div className="vc-img vc-img--placeholder">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="vc-img"
          />
        </div>

        {/* badges */}
        <div className="vc-badges">
          {isNew && <span className="vc-badge vc-badge--new">New</span>}
          {promoLabel && (
            <span className="vc-badge vc-badge--promo">{promoLabel}</span>
          )}
        </div>

        <div className="absolute right-2.5 top-2.5 z-[1]">
          <FavoriteButton vendorId={id} />
        </div>

        {/* closed overlay */}
        {!isOpen && (
          <div className="vc-closed-overlay">
            <span>Closed</span>
          </div>
        )}
      </div>

      {/* ── body ── */}
      <div className="vc-body">
        {/* row 1: name + rating */}
        <div className="vc-row vc-row--space">
          <p className="vc-name">{name}</p>
          <div className="vc-rating-wrap">
            <StarRating rating={rating} />
            <span className="vc-review-count">({reviewCount})</span>
          </div>
        </div>

        {/* row 2: cuisine + price range */}
        <div className="vc-row vc-row--space">
          <p className="vc-cuisine">{cuisine}</p>
          <span className="vc-price">{priceStr}</span>
        </div>

        {/* row 3: delivery info */}
        <div className="vc-meta">
          <span className="vc-chip">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {deliveryTime} mins
          </span>

          <span className="vc-chip">
            {deliveryFee === 0 ? (
              <>
                <span className="vc-chip-free">Free</span> delivery
              </>
            ) : (
              <>₦{deliveryFee.toLocaleString()} delivery</>
            )}
          </span>

          <span className="vc-chip vc-chip--muted">
            Min ₦{minOrder.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
