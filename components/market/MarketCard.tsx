import Link from "next/link";
import type { Market } from "@/features/markets/types";
import { getMarketDisplayMeta } from "@/lib/storefront/displayMeta";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyStrip } from "@/components/ui/DummyStrip";
import { ClockIcon, StoreIcon } from "@/components/icons";
import "./MarketCard.css";

/**
 * A third distinct card identity — "vendor/store imagery + product
 * categories + delivery information" per the redesign plan. Where
 * RestaurantCard leads with a rating+cuisine line and ShopCard leads with
 * delivery chips, MarketCard leads with a vendor-count pill and a row of
 * category tags, since "how many stalls, selling what" is the thing that
 * actually differentiates one market from another.
 */
export function MarketCard({ market }: { market: Market }) {
  const rating = Number(market.rating ?? 0);
  const meta = getMarketDisplayMeta(market);
  const categories = market.categories ?? [];

  return (
    <div className={`market-card ${!market.isOpen ? "market-card--closed" : ""}`}>
      <Link href={`/vendors/markets/${market.id}`} className="market-card__link">
        <div className="market-card__img-wrap">
          {isDummyId(market.id) && <DummyStrip />}
          <SafeImage src={market.imageUrl} alt={market.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
          {market.vendorCount != null && (
            <span className="market-card__vendor-count">
              <StoreIcon width={12} height={12} />
              {market.vendorCount} vendors
            </span>
          )}
          {!market.isOpen && (
            <div className="market-card__closed-overlay">
              <span>Closed</span>
            </div>
          )}
        </div>

        <div className="market-card__body">
          <div className="market-card__row">
            <p className="market-card__name">{market.name}</p>
            {rating > 0 && <Rating value={rating} count={meta.reviewCount} size="sm" />}
          </div>

          {categories.length > 0 && (
            <div className="market-card__categories">
              {categories.slice(0, 3).map((c) => (
                <span key={c} className="market-card__category-tag">
                  {c}
                </span>
              ))}
            </div>
          )}

          <span className="market-card__chip">
            <ClockIcon width={13} height={13} aria-hidden />
            {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 20} mins
          </span>
        </div>
      </Link>
    </div>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="market-card" aria-hidden>
      <Skeleton style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 0 }} />
      <div className="market-card__body">
        <Skeleton style={{ width: "65%", height: 14, marginBottom: 8 }} />
        <Skeleton style={{ width: "80%", height: 11, marginBottom: 12 }} />
        <Skeleton style={{ width: 90, height: 22, borderRadius: 999 }} />
      </div>
    </div>
  );
}
