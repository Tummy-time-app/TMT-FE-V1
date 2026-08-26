"use client";

import Link from "next/link";
import { useGetShopProductsQuery, useGetShopQuery } from "@/features/shops/shopsApi";
import { getShopDisplayMeta } from "@/lib/storefront/displayMeta";
import { normalizeApiError, getErrorMessage } from "@/lib/utils/apiError";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { DUMMY_SHOPS, dummyProductsFor } from "@/lib/dummy/shops.dummy";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { DummyStrip } from "@/components/ui/DummyStrip";
import {
  AlertTriangleIcon,
  BasketIcon,
  ChevronLeftIcon,
  ClockIcon,
  DeliveryIcon,
  MapPinIcon,
  ReceiptIcon,
} from "@/components/icons";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function ShopDetailSkeleton() {
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
 * Priority 4 (net-new — see the redesign plan's Phase 5). Deliberately
 * simpler than the restaurant detail page — no scroll-spy category nav,
 * a shop's ~3-4 products don't need one. "Add to cart" is intentionally
 * absent: CreateOrderPayload only supports restaurantId + MenuItem-shaped
 * line items (features/orders/types.ts) — there's no backend order type
 * for a shop purchase at all, so this browses real stock rather than
 * pretending a checkout flow exists behind it.
 */
export function ShopDetail({ shopId }: { shopId: string }) {
  const isDummyShopId = isDummyId(shopId);
  const {
    data: fetchedShop,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetShopQuery(shopId, { skip: isDummyShopId });
  const {
    data: fetchedProducts,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useGetShopProductsQuery(shopId, { skip: isDummyShopId || !fetchedShop });

  if (isLoading) return <ShopDetailSkeleton />;

  if (!isDummyShopId && (isError || !fetchedShop)) {
    const normalized = normalizeApiError(error);
    const notFound = normalized.status === 404;
    return (
      <EmptyState
        icon={notFound ? BasketIcon : AlertTriangleIcon}
        title={notFound ? "Shop not found" : "Couldn't load this shop"}
        message={notFound ? "It may have closed, or the link is wrong." : normalized.message}
        action={
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!notFound && (
              <button className="vp-empty-cta" onClick={() => refetch()}>
                Try again
              </button>
            )}
            <Link href="/vendors/shops" className="vp-empty-cta">
              ← Back to shops
            </Link>
          </div>
        }
      />
    );
  }

  // Same dummy-fallback rule as RestaurantView.tsx: a dummy shopId (from a
  // dummy card on the listing page) never hits the real queries at all; a
  // *real* shop with zero products falls back to dummy stock instead of a
  // bare "no products" message.
  const shop = isDummyShopId ? (DUMMY_SHOPS.find((s) => s.id === shopId) ?? DUMMY_SHOPS[0]) : fetchedShop!;
  const realProducts = fetchedProducts ?? [];
  const isProductsDummy = !isDummyShopId && !isLoadingProducts && !isProductsError && realProducts.length === 0;
  const isAnyDummy = isDummyShopId || isProductsDummy;
  const products = isDummyShopId ? dummyProductsFor(shopId) : isProductsDummy ? dummyProductsFor(shop.id) : realProducts;

  const meta = getShopDisplayMeta(shop);
  const rating = Number(shop.rating ?? 0);

  return (
    <div className="shop-detail">
      {isAnyDummy && (
        <div style={{ padding: "12px 20px 0" }}>
          <DummyBanner
            message={
              isDummyShopId
                ? "This is a sample shop page — not a real listing."
                : "This shop hasn't listed any products yet — showing sample stock so you can see how this page works."
            }
          />
        </div>
      )}
      <div className="shop-detail__hero">
        <SafeImage src={meta.coverImageUrl} alt={shop.name} fill className="shop-detail__hero-img" priority />
        <div className="shop-detail__scrim" aria-hidden />
        <Link href="/vendors/shops" className="shop-detail__back" aria-label="Back to shops">
          <ChevronLeftIcon width={18} height={18} />
        </Link>
        <div className="shop-detail__identity">
          <h1 className="shop-detail__name">{shop.name}</h1>
          <div className="shop-detail__meta-row">
            {rating > 0 && <Rating value={rating} count={meta.reviewCount} />}
            {rating > 0 && shop.category && <span className="shop-detail__dot" />}
            {shop.category && <span>{shop.category}</span>}
          </div>
        </div>
      </div>

      <div className="shop-detail__card">
        <div className="shop-detail__stats">
          <span className="shop-detail__stat">
            <ClockIcon />
            {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 15} min
          </span>
          <span className="shop-detail__stat">
            <DeliveryIcon />
            {meta.deliveryFeeNaira === 0 ? "Free delivery" : `${formatNaira(meta.deliveryFeeNaira)} delivery`}
          </span>
          <span className="shop-detail__stat">
            <ReceiptIcon />
            Min {formatNaira(meta.minimumOrderNaira)}
          </span>
        </div>

        {!shop.isOpen && (
          <div className="shop-detail__closed" role="status">
            <AlertTriangleIcon />
            <span>This shop is currently closed.</span>
          </div>
        )}

        <div className="shop-detail__address">
          <MapPinIcon width={15} height={15} />
          <span>{shop.address}</span>
        </div>
      </div>

      <section className="shop-detail__products">
        <div className="shop-detail__products-head">
          <h2 className="shop-detail__products-title">What&apos;s in stock</h2>
          <p className="shop-detail__products-note">Ordering from shops is coming soon — browsing only for now.</p>
        </div>

        {isLoadingProducts ? (
          <div className="shop-detail__grid" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 180, borderRadius: 14 }} />
            ))}
          </div>
        ) : isProductsError ? (
          <EmptyState
            icon={AlertTriangleIcon}
            title="Couldn't load products"
            message={getErrorMessage(productsError)}
            action={
              <button className="vp-empty-cta" onClick={() => refetchProducts()}>
                Try again
              </button>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState icon={BasketIcon} title="No products listed yet" />
        ) : (
          <div className="shop-detail__grid">
            {products.map((product) => (
              <div key={product.id} className={`product-card ${!product.available ? "product-card--unavailable" : ""}`}>
                <div className="product-card__img-wrap">
                  {isAnyDummy && <DummyStrip />}
                  <SafeImage src={product.imageUrl} alt={product.name} fill className="product-card__img" />
                  {!product.available && !isAnyDummy && <div className="product-card__sold-out">Out of stock</div>}
                </div>
                <p className="product-card__name">{product.name}</p>
                {product.unit && <p className="product-card__unit">{product.unit}</p>}
                <p className="product-card__price">{formatNaira(Number(product.price))}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
