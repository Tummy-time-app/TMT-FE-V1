"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useGetMenuQuery, useGetRestaurantQuery } from "@/features/restaurants/restaurantsApi";
import type { MenuItem } from "@/features/restaurants/types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

interface ModalState {
  item: MenuItem;
  qty: number;
}

/**
 * Adapted from the `frontend` branch's app/vendors/restaurants/[id]/
 * RestaurantClient.tsx. Real TMT-BE-V1 data via restaurantsApi instead of
 * the source's lib/restaurantData.ts mock dataset. The cart itself is
 * shared app-wide (lib/CartContext.tsx) instead of page-local state, so
 * "Go to Cart →" actually goes somewhere real — see app/cart/page.tsx.
 *
 * Dropped, all fake-data-only in the source:
 *  - the ETA chip, delivery-fee/min-order meta rows, and multi-tag list on
 *    the info block (no such fields on the real Restaurant type)
 *  - the item modal's "Pack options" step (its own comment called this
 *    "Mock pack options — replace with real data per item"; no per-item
 *    variant data exists on the real backend to replace it with)
 *  - the "popular" 🔥 badge on menu items (no such field on MenuItem)
 */
export function RestaurantView({ restaurantId }: { restaurantId: string }) {
  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    isError: isRestaurantError,
  } = useGetRestaurantQuery(restaurantId);
  const { data: menuItems = [], isLoading: isLoadingMenu } = useGetMenuQuery(restaurantId);
  const { cart, addItem, changeQty, cartCount, cartTotal } = useCart();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.category).filter((c): c is string => Boolean(c)));
    return Array.from(set);
  }, [menuItems]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  const inThisCart = cart.restaurantId === restaurantId ? cart.entries : [];
  const getCartQty = (id: string) => inThisCart.find((e) => e.item.id === id)?.qty ?? 0;

  const openModal = (item: MenuItem) => setModal({ item, qty: 1 });
  const closeModal = () => setModal(null);
  const modalTotal = modal ? Number(modal.item.price) * modal.qty : 0;

  const handleAddToCart = () => {
    if (!modal || !restaurant) return;
    addItem(restaurantId, restaurant.name, modal.item, modal.qty);
    closeModal();
  };

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

  const visibleCategories = search.trim() ? ["Results"] : categories;
  const itemsFor = (cat: string) =>
    cat === "Results" ? filteredItems : filteredItems.filter((i) => i.category === cat);

  if (isLoadingRestaurant) {
    return <div className="vp-empty">Loading…</div>;
  }

  if (isRestaurantError || !restaurant) {
    return (
      <div className="vp-empty">
        <p className="vp-empty-title">Restaurant not found</p>
        <Link href="/vendors/restaurants" className="vp-empty-cta">
          ← Back to restaurants
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rp-shell">
        <aside className="rp-left">
          <Link href="/vendors/restaurants" className="rp-breadcrumb__link">
            ← Restaurants
          </Link>

          <div className="rp-left__hero">
            {restaurant.imageUrl && (
              <Image src={restaurant.imageUrl} alt={restaurant.name} fill className="rp-left__hero-img" priority />
            )}
          </div>

          <div className="rp-left__info">
            <div className="rp-left__name-row">
              <h1 className="rp-left__name">{restaurant.name}</h1>
              {restaurant.rating != null && (
                <div className="rp-left__rating">
                  <span className="rp-left__rating-score">{Number(restaurant.rating).toFixed(1)}</span>
                  <span className="rp-left__rating-star">★</span>
                </div>
              )}
            </div>

            <p className="rp-left__hours">{restaurant.isOpen ? "Open now" : "Currently closed"}</p>

            <div className="rp-left__meta-list">
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon">📍</span>
                <span>{restaurant.address}</span>
              </div>
            </div>

            {restaurant.cuisine && (
              <div className="rp-left__tags">
                <span className="rp-tag">{restaurant.cuisine}</span>
              </div>
            )}
          </div>
        </aside>

        <div className="rp-right">
          <div className="rp-right__sticky">
            <div className="rp-right__search-wrap">
              <svg
                className="rp-right__search-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="rp-right__search"
                placeholder={`search ${restaurant.name.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="rp-search__clear" onClick={() => setSearch("")}>
                  ✕
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div className="rp-right__tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`rp-right__tab ${activeCategory === cat ? "rp-right__tab--active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rp-right__menu">
            {isLoadingMenu ? (
              <p className="vp-empty">Loading menu…</p>
            ) : menuItems.length === 0 ? (
              <p className="vp-empty">This restaurant hasn&apos;t added any menu items yet.</p>
            ) : (
              (search.trim() ? visibleCategories : [activeCategory ?? categories[0]]).map((cat) => {
                if (!cat) return null;
                const items = itemsFor(cat);
                if (!items.length) return null;
                return (
                  <section key={cat} id={cat} className="rp-section">
                    <h2 className="rp-section__title">{cat}</h2>

                    <div className="rp-list">
                      {items.map((item) => {
                        const qty = getCartQty(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`rp-list-item ${!item.available ? "rp-list-item--unavailable" : ""}`}
                            onClick={() => item.available && openModal(item)}
                          >
                            <div className="rp-list-item__body">
                              <p className="rp-list-item__name">{item.name}</p>
                              {item.description && (
                                <p className="rp-list-item__desc">{item.description}</p>
                              )}
                              <p className="rp-list-item__price">{formatNaira(Number(item.price))}</p>
                              {qty > 0 && <span className="rp-list-item__in-cart">{qty} in cart</span>}
                            </div>

                            <div className="rp-list-item__img-wrap">
                              {item.imageUrl && (
                                <Image src={item.imageUrl} alt={item.name} fill className="rp-list-item__img" />
                              )}
                              {!item.available && <div className="rp-list-item__sold-out">Sold out</div>}
                              {item.available && (
                                <button
                                  className="rp-list-item__add"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(item);
                                  }}
                                  aria-label={`Add ${item.name}`}
                                >
                                  <span className="rp-list-item__add-icon">+</span>
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

      {/* ── FLOATING CART BAR ── */}
      {cartCount > 0 && cart.restaurantId === restaurantId && (
        <div className="rp-cart-bar" onClick={() => setCartOpen(true)}>
          <div className="rp-cart-bar__count">{cartCount}</div>
          <span className="rp-cart-bar__label">View Cart</span>
          <span className="rp-cart-bar__total">{formatNaira(cartTotal)}</span>
        </div>
      )}

      <div className={`rp-backdrop ${cartOpen ? "rp-backdrop--visible" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`rp-cart-drawer ${cartOpen ? "rp-cart-drawer--open" : ""}`}>
        <div className="rp-cart-drawer__header">
          <h3 className="rp-cart-drawer__title">Your Order</h3>
          <button className="rp-cart-drawer__close" onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>

        <div className="rp-cart-drawer__vendor">
          <span>🏪</span>
          <span>{restaurant.name}</span>
        </div>
        <div className="rp-cart-drawer__items">
          {inThisCart.map((entry) => (
            <div key={entry.item.id} className="rp-cart-entry">
              <div className="rp-cart-entry__img-wrap">
                {entry.item.imageUrl && (
                  <Image src={entry.item.imageUrl} alt={entry.item.name} fill className="object-cover" />
                )}
              </div>
              <div className="rp-cart-entry__body">
                <p className="rp-cart-entry__name">{entry.item.name}</p>
                <p className="rp-cart-entry__price">{formatNaira(Number(entry.item.price) * entry.qty)}</p>
              </div>
              <div className="rp-stepper rp-stepper--sm">
                <button className="rp-stepper__btn" onClick={() => changeQty(entry.item.id, -1)}>
                  −
                </button>
                <span className="rp-stepper__val">{entry.qty}</span>
                <button className="rp-stepper__btn rp-stepper__btn--plus" onClick={() => changeQty(entry.item.id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="rp-cart-drawer__summary">
          <div className="rp-cart-drawer__total">
            <span>Total</span>
            <span>{formatNaira(cartTotal)}</span>
          </div>
        </div>
        <Link href="/cart" className="rp-cart-drawer__cta" onClick={() => setCartOpen(false)}>
          Go to Cart →
        </Link>
      </aside>

      {/* ── ITEM MODAL ── */}
      {modal && (
        <>
          <div className="rp-modal-backdrop" onClick={closeModal} />
          <div className="rp-modal" role="dialog" aria-modal="true" aria-label={modal.item.name}>
            <button className="rp-modal__close" onClick={closeModal} aria-label="Close">
              ✕
            </button>

            <div className="rp-modal__img-wrap">
              {modal.item.imageUrl && (
                <Image src={modal.item.imageUrl} alt={modal.item.name} fill className="rp-modal__img" />
              )}
            </div>

            <div className="rp-modal__body">
              <h2 className="rp-modal__name">{modal.item.name}</h2>
              {modal.item.description && <p className="rp-modal__desc">{modal.item.description}</p>}
              <p className="rp-modal__base-price">
                {formatNaira(Number(modal.item.price))} <span>Per item</span>
              </p>
            </div>

            <div className="rp-modal__footer">
              <div className="rp-modal__stepper">
                <button
                  className="rp-modal__stepper-btn"
                  onClick={() => setModal((m) => (m ? { ...m, qty: Math.max(1, m.qty - 1) } : m))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="rp-modal__stepper-val">{modal.qty}</span>
                <button
                  className="rp-modal__stepper-btn rp-modal__stepper-btn--plus"
                  onClick={() => setModal((m) => (m ? { ...m, qty: m.qty + 1 } : m))}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

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
