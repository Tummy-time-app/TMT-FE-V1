import Link from "next/link";
import type { Shop } from "@/features/shops/types";
import { getShopDisplayMeta } from "@/lib/storefront/displayMeta";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyStrip } from "@/components/ui/DummyStrip";
import { ClockIcon, DeliveryIcon } from "@/components/icons";
import "./ShopCard.css";

/**
 * Deliberately not a re-skinned RestaurantCard — "different commerce
 * categories should have different visual identities" (the redesign
 * plan's Phase 5). A shop's image is a 4:3 storefront/product photo
 * rather than a 16:9 hero food shot, and the amber accent (vs.
 * RestaurantCard's crimson) is the one consistent tell that this is a
 * retail card, not a restaurant one, at a glance.
 */
export function ShopCard({ shop }: { shop: Shop }) {
  const rating = Number(shop.rating ?? 0);
  const meta = getShopDisplayMeta(shop);

  return (
    <div className={`shop-card ${!shop.isOpen ? "shop-card--closed" : ""}`}>
      <Link href={`/vendors/shops/${shop.id}`} className="shop-card__link">
        <div className="shop-card__img-wrap">
          {isDummyId(shop.id) && <DummyStrip />}
          <SafeImage src={shop.imageUrl} alt={shop.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
          {meta.promoLabel && <span className="shop-card__badge">{meta.promoLabel}</span>}
          {!shop.isOpen && (
            <div className="shop-card__closed-overlay">
              <span>Closed</span>
            </div>
          )}
        </div>

        <div className="shop-card__body">
          <div className="shop-card__row">
            <p className="shop-card__name">{shop.name}</p>
            {rating > 0 && <Rating value={rating} count={meta.reviewCount} size="sm" />}
          </div>

          <p className="shop-card__category">{shop.category || "Shop"}</p>

          <div className="shop-card__meta">
            <span className="shop-card__chip">
              <ClockIcon width={13} height={13} aria-hidden />
              {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 15} mins
            </span>
            <span className="shop-card__chip">
              <DeliveryIcon width={13} height={13} aria-hidden />
              {meta.deliveryFeeNaira === 0 ? "Free delivery" : `₦${meta.deliveryFeeNaira.toLocaleString()} delivery`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="shop-card" aria-hidden>
      <Skeleton style={{ width: "100%", aspectRatio: "4 / 3", borderRadius: 0 }} />
      <div className="shop-card__body">
        <Skeleton style={{ width: "65%", height: 14, marginBottom: 8 }} />
        <Skeleton style={{ width: "40%", height: 11, marginBottom: 12 }} />
        <div className="shop-card__meta">
          <Skeleton style={{ width: 80, height: 22, borderRadius: 999 }} />
          <Skeleton style={{ width: 80, height: 22, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
