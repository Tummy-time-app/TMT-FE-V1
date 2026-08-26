"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useGetMenuQuery, useGetRestaurantQuery } from "@/features/restaurants/restaurantsApi";
import type { MenuItem } from "@/features/restaurants/types";
import { getMenuItemDisplayMeta, getRestaurantDisplayMeta } from "@/lib/storefront/displayMeta";
import { useFavorites } from "@/lib/useFavorites";
import { normalizeApiError, getErrorMessage } from "@/lib/utils/apiError";
import { isDummyId } from "@/lib/dummy/isDummyId";
import { DUMMY_RESTAURANTS, dummyMenuItemsFor } from "@/lib/dummy/restaurants.dummy";
import { SafeImage } from "@/components/ui/SafeImage";
import { Rating } from "@/components/ui/Rating";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DummyBanner } from "@/components/ui/DummyBanner";
import { DummyStrip } from "@/components/ui/DummyStrip";
import {
  ClockIcon,
  DeliveryIcon,
  ReceiptIcon,
  MapPinIcon,
  HeartIcon,
  ExternalLinkIcon,
  SearchIcon,
  ChevronLeftIcon,
  CloseIcon,
  FlameIcon,
  LeafIcon,
  AlertTriangleIcon,
  UtensilsIcon,
} from "@/components/icons";
import { Map } from "@/components/maps/Map";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

interface ModalState {
  item: MenuItem;
  qty: number;
}

/** Stable reference for "no real menu yet" — a fresh `[]` literal every render defeats useMemo/the React Compiler's own memoization downstream. */
const EMPTY_MENU_ITEMS: MenuItem[] = [];

function RestaurantViewSkeleton() {
  return (
    <div className="rp-shell" aria-hidden>
      <aside className="rp-left">
        <div className="rp-hero">
          <Skeleton style={{ width: "100%", height: 300, borderRadius: 0 }} />
        </div>
        <div className="rp-hero__card" style={{ marginTop: -20 }}>
          <Skeleton style={{ width: "70%", height: 22 }} />
          <Skeleton style={{ width: "45%", height: 14 }} />
          <Skeleton style={{ width: "100%", height: 70 }} />
        </div>
      </aside>
      <div className="rp-right">
        <div className="rp-right__menu">
          <Skeleton style={{ width: "30%", height: 20, margin: "24px 0 16px" }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 92, marginBottom: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Adapted from the `frontend` branch's app/vendors/restaurants/[id]/
 * RestaurantClient.tsx. Real TMT-BE-V1 data via restaurantsApi instead of
 * the source's lib/restaurantData.ts mock dataset.
 *
 * "TummyTime 2.0" marketplace redesign: layered hero (image → gradient
 * scrim → identity text, floating info card underneath) replaces the old
 * image-then-plain-info-block layout; every emoji (📍🛵📋❤️🤍🔗✕🌶️🌱🔥⚠️)
 * is now a real icon (components/icons.tsx); the category nav is a real
 * sticky scroll-spy (IntersectionObserver — the source branch had this
 * exact pattern, it just wasn't ported when this page was rebuilt against
 * real data) instead of click-to-swap-the-visible-section; all categories
 * render in one continuous scroll now, which is what makes the scroll-spy
 * meaningful. Delivery ETA/fee/min-order/reviews/tags/popular-spicy-
 * vegetarian badges are real fields with a deterministic placeholder
 * fallback (lib/storefront/displayMeta.ts) where the backend doesn't have
 * them yet. Save/Share are genuinely wired (lib/useFavorites.ts, Web
 * Share API / clipboard). The floating cart bar/drawer that used to live
 * here moved to a global MiniCartBar (components/cart/), mounted once in
 * app/layout.tsx — it now follows the customer everywhere, not just this
 * page.
 */
export function RestaurantView({ restaurantId }: { restaurantId: string }) {
  const isDummyRestaurantId = isDummyId(restaurantId);
  const {
    data: fetchedRestaurant,
    isLoading: isLoadingRestaurant,
    isError: isRestaurantError,
    error: restaurantError,
    refetch: refetchRestaurant,
  } = useGetRestaurantQuery(restaurantId, { skip: isDummyRestaurantId });
  const {
    data: fetchedMenuItems,
    isLoading: isLoadingMenu,
    isError: isMenuError,
    error: menuError,
    refetch: refetchMenu,
  } = useGetMenuQuery(restaurantId, { skip: isDummyRestaurantId });
  const { cart, addItem } = useCart();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  // A dummy restaurantId (from a dummy card on the listing page) never
  // hits the real queries above at all — it renders straight from lib/
  // dummy/restaurants.dummy.ts. A *real* restaurant with a genuinely
  // empty menu (isSuccess, zero items — never on loading/error) also
  // falls back to dummy dishes rather than a bare "no menu" message, per
  // the same "show something rather than nothing, but say so clearly"
  // rule as every other list/detail page in the marketplace.
  const restaurant = isDummyRestaurantId
    ? (DUMMY_RESTAURANTS.find((r) => r.id === restaurantId) ?? DUMMY_RESTAURANTS[0])
    : fetchedRestaurant;
  const realMenuItems = fetchedMenuItems ?? EMPTY_MENU_ITEMS;
  const isMenuDummy = !isDummyRestaurantId && !isLoadingMenu && !isMenuError && Boolean(restaurant) && realMenuItems.length === 0;
  const isAnyDummy = isDummyRestaurantId || isMenuDummy;
  // Memoized so this has a stable reference across renders when it's the
  // real (already-stable) query data — dummyMenuItemsFor() itself returns
  // a fresh array each call, which would otherwise defeat the `categories`
  // useMemo (and the React Compiler's own memoization) below.
  const menuItems = useMemo(() => {
    if (isDummyRestaurantId) return dummyMenuItemsFor(restaurantId);
    if (isMenuDummy) return dummyMenuItemsFor(restaurant?.id ?? restaurantId);
    return realMenuItems;
  }, [isDummyRestaurantId, isMenuDummy, restaurantId, restaurant, realMenuItems]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.category).filter((c): c is string => Boolean(c)));
    return Array.from(set);
  }, [menuItems]);

  // Derived at render time, not synced via an effect — categories only
  // exist once the menu query resolves, so there's no valid initial
  // useState value to seed. An explicit tab click or a scroll-spy update
  // (below) still always wins once either has happened.
  const effectiveCategory = activeCategory ?? categories[0] ?? null;

  // Real scroll-spy: as the menu scrolls, highlight whichever category
  // section is actually in view. Legitimate use of an effect (subscribing
  // to a browser API, calling setState from its callback) — not the
  // sync-on-render anti-pattern `effectiveCategory` above avoids.
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        }
      },
      { root: panel, rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    for (const cat of categories) {
      const el = categoryRefs.current[cat];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories, menuItems]);

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    const panel = rightPanelRef.current;
    if (el && panel) {
      panel.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
  };

  const inThisCart = cart.restaurantId === restaurantId ? cart.entries : [];
  const getCartQty = (id: string) => inThisCart.find((e) => e.item.id === id)?.qty ?? 0;

  // Never orderable when any of this is sample data — a fake dish added
  // to a real cart would try to check out against a restaurantId (or
  // menuItemId) the backend has never heard of.
  const canOrder = Boolean(restaurant?.isOpen) && !isAnyDummy;
  const openModal = (item: MenuItem) => {
    if (!canOrder || !item.available) return;
    setModal({ item, qty: 1 });
  };
  const closeModal = () => setModal(null);
  const modalTotal = modal ? Number(modal.item.price) * modal.qty : 0;

  const handleAddToCart = () => {
    if (!modal || !restaurant) return;
    addItem(restaurantId, restaurant.name, modal.item, modal.qty);
    closeModal();
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: restaurant?.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch {
      // Share sheet dismissed, or clipboard unavailable — neither is worth surfacing.
    }
  };

  useEffect(() => {
    if (shareState !== "copied") return;
    const t = setTimeout(() => setShareState("idle"), 2000);
    return () => clearTimeout(t);
  }, [shareState]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  const filteredItems = search.trim()
    ? menuItems.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          (i.description ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : menuItems;
  const itemsForCategory = (cat: string) => filteredItems.filter((i) => i.category === cat);

  if (isLoadingRestaurant) {
    return <RestaurantViewSkeleton />;
  }

  if (isRestaurantError || !restaurant) {
    const normalized = normalizeApiError(restaurantError);
    const notFound = normalized.status === 404;
    return (
      <EmptyState
        icon={notFound ? UtensilsIcon : AlertTriangleIcon}
        title={notFound ? "Restaurant not found" : "Couldn't load this restaurant"}
        message={notFound ? "It may have closed, or the link is wrong." : normalized.message}
        action={
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!notFound && (
              <button className="vp-empty-cta" onClick={() => refetchRestaurant()}>
                Try again
              </button>
            )}
            <Link href="/vendors/restaurants" className="vp-empty-cta">
              ← Back to restaurants
            </Link>
          </div>
        }
      />
    );
  }

  const meta = getRestaurantDisplayMeta(restaurant);
  const saved = isFavorite(restaurant.id);

  return (
    <>
      {isAnyDummy && (
        <div style={{ padding: "12px 20px 0" }}>
          <DummyBanner
            message={
              isDummyRestaurantId
                ? "This is a sample restaurant page — not a real listing."
                : "This restaurant hasn't published a menu yet — showing sample dishes so you can see how this page works."
            }
          />
        </div>
      )}
      <div className="rp-shell">
        <aside className="rp-left">
          <div className="rp-hero">
            <div className="rp-hero__media">
              <SafeImage src={meta.coverImageUrl} alt={restaurant.name} fill className="rp-hero__img" priority />
              <div className="rp-hero__scrim" aria-hidden />
              <Link href="/vendors/restaurants" className="rp-hero__back" aria-label="Back to restaurants">
                <ChevronLeftIcon width={18} height={18} />
              </Link>
              {meta.promoLabel && <span className="rp-hero__promo">{meta.promoLabel}</span>}
              <div className="rp-hero__identity">
                <h1 className="rp-hero__name">{restaurant.name}</h1>
                <div className="rp-hero__meta-row">
                  {restaurant.rating != null && <Rating value={Number(restaurant.rating)} count={meta.reviewCount} />}
                  {restaurant.rating != null && restaurant.cuisine && <span className="rp-hero__dot" />}
                  {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                </div>
              </div>
            </div>

            <div className="rp-hero__card">
              <div className="rp-hero__stats">
                <span className="rp-hero__stat">
                  <ClockIcon />
                  {meta.deliveryEtaMinutes}–{meta.deliveryEtaMinutes + 10} min
                </span>
                <span className={`rp-hero__stat ${meta.deliveryFeeNaira === 0 ? "rp-hero__stat--free" : ""}`}>
                  <DeliveryIcon />
                  {meta.deliveryFeeNaira === 0 ? "Free delivery" : `${formatNaira(meta.deliveryFeeNaira)} delivery`}
                </span>
                <span className="rp-hero__stat">
                  <ReceiptIcon />
                  Min {formatNaira(meta.minimumOrderNaira)}
                </span>
              </div>

              {!restaurant.isOpen && (
                <div className="rp-hero__closed" role="status">
                  <AlertTriangleIcon />
                  <span>Currently closed — you can browse the menu, but ordering isn&apos;t available right now.</span>
                </div>
              )}

              <div className="rp-hero__address">
                <MapPinIcon width={15} height={15} />
                <span>{restaurant.address}</span>
              </div>

              {restaurant.lat != null && restaurant.lng != null && (
                <div className="rp-hero__map">
                  <Map
                    center={{ lat: restaurant.lat, lng: restaurant.lng }}
                    zoom={15}
                    markers={[{ id: restaurant.id, kind: "vendor", lat: restaurant.lat, lng: restaurant.lng }]}
                    height={140}
                  />
                </div>
              )}

              {meta.tags.length > 0 && (
                <div className="rp-tags">
                  {meta.tags.map((tag) => (
                    <span key={tag} className="rp-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="rp-hero__actions">
                <button
                  type="button"
                  className={`rp-action-btn ${saved ? "rp-action-btn--active" : ""}`}
                  onClick={() => toggleFavorite(restaurant.id)}
                  aria-pressed={saved}
                >
                  <HeartIcon style={saved ? { color: "var(--crimson-500)" } : undefined} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button type="button" className="rp-action-btn" onClick={() => void handleShare()}>
                  <ExternalLinkIcon />
                  {shareState === "copied" ? "Link copied" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="rp-right" ref={rightPanelRef}>
          <div className="rp-right__sticky">
            <div className="rp-right__search-wrap">
              <SearchIcon />
              <input
                type="text"
                className="rp-right__search"
                placeholder={`Search ${restaurant.name.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="rp-search__clear" onClick={() => setSearch("")} aria-label="Clear search">
                  <CloseIcon width={13} height={13} />
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div className="rp-right__tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`rp-right__tab ${effectiveCategory === cat ? "rp-right__tab--active" : ""}`}
                    onClick={() => scrollToCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rp-right__menu">
            {isLoadingMenu ? (
              <div aria-hidden style={{ paddingTop: 8 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} style={{ height: 92, marginBottom: 12 }} />
                ))}
              </div>
            ) : isMenuError ? (
              <EmptyState
                icon={AlertTriangleIcon}
                title="Couldn't load the menu"
                message={getErrorMessage(menuError)}
                action={
                  <button className="vp-empty-cta" onClick={() => refetchMenu()}>
                    Try again
                  </button>
                }
              />
            ) : menuItems.length === 0 ? (
              <EmptyState icon={UtensilsIcon} title="No menu items yet" message="This restaurant hasn't added any menu items yet." />
            ) : (
              categories.map((cat) => {
                const items = itemsForCategory(cat);
                if (!items.length) return null;
                return (
                  <section
                    key={cat}
                    id={cat}
                    ref={(el) => {
                      categoryRefs.current[cat] = el;
                    }}
                    className="rp-section"
                  >
                    <h2 className="rp-section__title">{cat}</h2>

                    <div className="rp-list">
                      {items.map((item) => {
                        const qty = getCartQty(item.id);
                        const itemMeta = getMenuItemDisplayMeta(item);
                        const orderable = item.available && canOrder;
                        return (
                          <div
                            key={item.id}
                            className={`rp-list-item ${!orderable && !isAnyDummy ? "rp-list-item--unavailable" : ""}`}
                            onClick={() => !isAnyDummy && openModal(item)}
                          >
                            <div className="rp-list-item__body">
                              <p className="rp-list-item__name">
                                {item.name}
                                <span className="rp-list-item__badges">
                                  {itemMeta.isSpicy && (
                                    <span className="rp-tag" title="Spicy">
                                      Spicy
                                    </span>
                                  )}
                                  {itemMeta.isVegetarian && (
                                    <LeafIcon
                                      className="rp-list-item__badge-icon rp-list-item__badge-icon--veg"
                                      role="img"
                                      aria-label="Vegetarian"
                                    />
                                  )}
                                </span>
                              </p>
                              {item.description && <p className="rp-list-item__desc">{item.description}</p>}
                              <p className="rp-list-item__price">{formatNaira(Number(item.price))}</p>
                              {qty > 0 && <span className="rp-list-item__in-cart">{qty} in cart</span>}
                            </div>

                            <div className="rp-list-item__img-wrap">
                              {isAnyDummy && <DummyStrip />}
                              <SafeImage src={item.imageUrl} alt={item.name} fill className="rp-list-item__img" />
                              {itemMeta.isPopular && !isAnyDummy && (
                                <span className="rp-list-item__badge">
                                  <FlameIcon />
                                  Popular
                                </span>
                              )}
                              {!orderable && !isAnyDummy && (
                                <div className="rp-list-item__sold-out">{!item.available ? "Sold out" : "Closed"}</div>
                              )}
                              {orderable && (
                                <button
                                  className="rp-list-item__add"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(item);
                                  }}
                                  aria-label={`Add ${item.name}`}
                                >
                                  <span aria-hidden style={{ fontSize: "0.9rem", lineHeight: 1 }}>
                                    +
                                  </span>
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── ITEM MODAL ── */}
      {modal && (
        <>
          <div className="rp-modal-backdrop" onClick={closeModal} />
          <div className="rp-modal" role="dialog" aria-modal="true" aria-label={modal.item.name}>
            <button className="rp-modal__close" onClick={closeModal} aria-label="Close">
              <CloseIcon width={15} height={15} />
            </button>

            <div className="rp-modal__img-wrap">
              <SafeImage src={modal.item.imageUrl} alt={modal.item.name} fill className="rp-modal__img" />
            </div>

            <div className="rp-modal__body">
              {(() => {
                const itemMeta = getMenuItemDisplayMeta(modal.item);
                if (!itemMeta.isPopular && !itemMeta.isSpicy && !itemMeta.isVegetarian) return null;
                return (
                  <div className="rp-modal__badges">
                    {itemMeta.isPopular && (
                      <span className="rp-modal__badge">
                        <FlameIcon />
                        Popular
                      </span>
                    )}
                    {itemMeta.isSpicy && <span className="rp-modal__badge">Spicy</span>}
                    {itemMeta.isVegetarian && (
                      <span className="rp-modal__badge">
                        <LeafIcon />
                        Vegetarian
                      </span>
                    )}
                  </div>
                );
              })()}
              <h2 className="rp-modal__name">{modal.item.name}</h2>
              {modal.item.description && <p className="rp-modal__desc">{modal.item.description}</p>}
              <p className="rp-modal__base-price">
                {formatNaira(Number(modal.item.price))} <span>Per item</span>
              </p>
            </div>

            <div className="rp-modal__footer">
              <QuantityStepper
                value={modal.qty}
                onDecrease={() => setModal((m) => (m ? { ...m, qty: Math.max(1, m.qty - 1) } : m))}
                onIncrease={() => setModal((m) => (m ? { ...m, qty: m.qty + 1 } : m))}
              />
              <button className="rp-modal__add-btn" onClick={handleAddToCart}>
                <span>Add to cart</span>
                <span className="rp-modal__add-price">{formatNaira(modalTotal)}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
