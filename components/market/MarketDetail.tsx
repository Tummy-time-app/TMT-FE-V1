"use client";

import Link from "next/link";
import { useGetMarketQuery } from "@/features/markets/marketsApi";
import { getMarketDisplayMeta } from "@/lib/storefront/displayMeta";
import { normalizeApiError } from "@/lib/utils/apiError";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { DUMMY_MARKETS } from "@/lib/dummy/markets.dummy";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { DummyStrip } from "@/components/ui/DummyStrip";
import { AlertTriangleIcon, ChevronLeftIcon, ClockIcon, DeliveryIcon, LeafIcon, MapPinIcon } from "@/components/icons";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function MarketDetailSkeleton() {
  return (
    <div className="shop-detail" aria-hidden>
      <Skeleton style={{ width: "100%", height: 240, borderRadius: 0 }} />
      <div className="shop-detail__card">
        <Skeleton style={{ width: "60%", height: 22 }} />
        <Skeleton style={{ width: "100%", height: 60, marginTop: 12 }} />
      </div>
    </div>
  );
}

/**
 * Priority 4 (net-new — see the redesign plan's Phase 5). Simplest of the
 * three detail pages: a market is browsed by its vendor list, not a
 * product catalog (see features/markets/types.ts's doc comment for why),
 * so there's no add-to-cart concern here at all — this is honestly just
 * a directory. Reuses app/shop-detail.css's `.shop-detail*` layout
 * classes (same hero/card shape) rather than duplicating them.
 */
export function MarketDetail({ marketId }: { marketId: string }) {
  const isDummyMarketId = isDummyId(marketId);
  const {
    data: fetchedMarket,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMarketQuery(marketId, { skip: isDummyMarketId });

  if (isLoading) return <MarketDetailSkeleton />;

  if (!isDummyMarketId && (isError || !fetchedMarket)) {
    const normalized = normalizeApiError(error);
    const notFound = normalized.status === 404;
    return (
      <EmptyState
        icon={notFound ? LeafIcon : AlertTriangleIcon}
        title={notFound ? "Market not found" : "Couldn't load this market"}
        message={notFound ? "It may have closed, or the link is wrong." : normalized.message}
        action={
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!notFound && (
              <button className="vp-empty-cta" onClick={() => refetch()}>
                Try again
              </button>
            )}
            <Link href="/vendors/markets" className="vp-empty-cta">
              ← Back to markets
            </Link>
          </div>
        }
      />
    );
  }

  // Same dummy-fallback rule as ShopDetail.tsx/RestaurantView.tsx. Markets
  // carry their vendor list inline (no separate query), so a real market
  // with an empty `vendors` array falls back to the dummy market's own
  // vendor list rather than a second fetch.
  const market = isDummyMarketId ? (DUMMY_MARKETS.find((m) => m.id === marketId) ?? DUMMY_MARKETS[0]) : fetchedMarket!;
  const realVendors = market.vendors ?? [];
  const isVendorsDummy = !isDummyMarketId && realVendors.length === 0;
  const isAnyDummy = isDummyMarketId || isVendorsDummy;
  const vendors = isAnyDummy ? (DUMMY_MARKETS[0].vendors ?? []) : realVendors;

  const meta = getMarketDisplayMeta(market);
  const rating = Number(market.rating ?? 0);

  return (
    <div className="shop-detail">
      {isAnyDummy && (
        <div style={{ padding: "12px 20px 0" }}>
          <DummyBanner
            message={
              isDummyMarketId
                ? "This is a sample market page — not a real listing."
                : "This market hasn't listed any vendors yet — showing sample vendors so you can see how this page works."
            }
          />
        </div>
      )}
      <div className="shop-detail__hero">
        <SafeImage src={market.imageUrl} alt={market.name} fill className="shop-detail__hero-img" priority />
        <div className="shop-detail__scrim" aria-hidden />
        <Link href="/vendors/markets" className="shop-detail__back" aria-label="Back to markets">
          <ChevronLeftIcon width={18} height={18} />
        </Link>
        <div className="shop-detail__identity">
          <h1 className="shop-detail__name">{market.name}</h1>
          <div className="shop-detail__meta-row">
            {rating > 0 && <Rating value={rating} count={meta.reviewCount} />}
            {rating > 0 && market.vendorCount != null && <span className="shop-detail__dot" />}
            {market.vendorCount != null && <span>{market.vendorCount} vendors</span>}
          </div>
        </div>
      </div>

      <div className="shop-detail__card">
        <div className="shop-detail__stats">
          <span className="shop-detail__stat">
            <ClockIcon />
            {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 20} min
          </span>
          <span className="shop-detail__stat">
            <DeliveryIcon />
            {meta.deliveryFeeNaira === 0 ? "Free delivery" : `${formatNaira(meta.deliveryFeeNaira)} delivery`}
          </span>
        </div>

        {!market.isOpen && (
          <div className="shop-detail__closed" role="status">
            <AlertTriangleIcon />
            <span>This market is currently closed.</span>
          </div>
        )}

        <div className="shop-detail__address">
          <MapPinIcon width={15} height={15} />
          <span>{market.address}</span>
        </div>

        {market.categories && market.categories.length > 0 && (
          <div className="rp-tags">
            {market.categories.map((c) => (
              <span key={c} className="rp-tag">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="shop-detail__products">
        <div className="shop-detail__products-head">
          <h2 className="shop-detail__products-title">Vendors at this market</h2>
        </div>

        {vendors.length === 0 ? (
          <EmptyState icon={LeafIcon} title="No vendors listed yet" />
        ) : (
          <div className="shop-detail__grid">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="product-card">
                <div className="product-card__img-wrap">
                  {isAnyDummy && <DummyStrip />}
                  <SafeImage src={vendor.imageUrl} alt={vendor.name} fill className="product-card__img" />
                </div>
                <p className="product-card__name">{vendor.name}</p>
                <p className="product-card__unit">{vendor.categories.join(", ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
