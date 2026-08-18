"use client";
import { CartEntry, MenuItem, type RestaurantData } from "@/lib/restaurantData";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/* ── Item modal types ────────────────────────────────────── */
interface PackOption {
  id: string;
  label: string;
  price: number;
}

interface ModalState {
  item: MenuItem;
  qty: number;
  selectedPack: string | null;
}

/* Mock pack options — replace with real data per item */
const PACK_OPTIONS: PackOption[] = [
  { id: "big",     label: "Big pack",      price: 400 },
  { id: "regular", label: "Pack",          price: 400 },
  { id: "branded", label: "Branded pack",  price: 400 },
];

interface Props {
  data: RestaurantData;
}

export function RestaurantClient({ data }: Props) {
  const { restaurant, menuItems: allItems } = data;

  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0] ?? "");
  const [cart, setCart]         = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<ModalState | null>(null);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement>(null);

  /* ── Cart helpers ──────────────────────────────────────── */
  const cartTotal = cart.reduce((s, e) => s + e.item.price * e.qty, 0);
  const cartCount = cart.reduce((s, e) => s + e.qty, 0);

  const addToCart = useCallback((item: MenuItem, qty: number) => {
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id);
      if (existing) return prev.map(e =>
        e.item.id === item.id ? { ...e, qty: e.qty + qty } : e
      );
      return [...prev, { item, qty }];
    });
  }, []);

  const changeCartQty = (id: number, delta: number) => {
    setCart(prev =>
      prev
        .map(e => e.item.id === id ? { ...e, qty: Math.max(0, e.qty + delta) } : e)
        .filter(e => e.qty > 0)
    );
  };

  const getCartQty = (id: number) => cart.find(e => e.item.id === id)?.qty ?? 0;

  /* ── Modal helpers ─────────────────────────────────────── */
  const openModal = (item: MenuItem) => {
    setModal({ item, qty: 1, selectedPack: null });
  };

  const closeModal = () => setModal(null);

  const modalTotal = modal
    ? modal.item.price * modal.qty +
      (modal.selectedPack
        ? (PACK_OPTIONS.find(p => p.id === modal.selectedPack)?.price ?? 0) * modal.qty
        : 0)
    : 0;

  const handleAddToCart = () => {
    if (!modal) return;
    addToCart(modal.item, modal.qty);
    closeModal();
  };

  /* ── Category scroll spy (right panel) ─────────────────── */
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        });
      },
      { root: panel, rootMargin: "-30% 0px -60% 0px" }
    );

    Object.values(categoryRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [allItems]);

  /* ── Scroll to category ─────────────────────────────────── */
  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    const panel = rightPanelRef.current;
    if (el && panel) {
      const top = el.offsetTop - 80;
      panel.scrollTo({ top, behavior: "smooth" });
    }
  };

  /* ── Filtered items ─────────────────────────────────────── */
  const filtered = search.trim()
    ? allItems.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      )
    : allItems;

  const categories = search.trim() ? ["Results"] : restaurant.categories;
  const itemsFor = (cat: string) =>
    cat === "Results" ? filtered : filtered.filter(i => i.category === cat);

  /* ── Lock body scroll when modal open ─────────────────── */
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  return (
    <>
      <div className="rp-shell">
        <aside className="rp-left">
          {/* breadcrumb */}
          <Link href="/vendors/restaurants" className="rp-breadcrumb__link">
            ← Restaurants
          </Link>

          {/* hero image */}
          <div className="rp-left__hero">
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              fill
              className="rp-left__hero-img"
              priority
            />
            {/* delivery time chip */}
            <div className="rp-left__eta-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#AC0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {restaurant.deliveryTime} Mins
            </div>
          </div>

          {/* info block */}
          <div className="rp-left__info">
            <div className="rp-left__name-row">
              <h1 className="rp-left__name">{restaurant.name}</h1>
              <div className="rp-left__rating">
                <span className="rp-left__rating-score">{restaurant.rating}</span>
                <span className="rp-left__rating-star">★</span>
              </div>
            </div>

            <p className="rp-left__hours">
              {restaurant.isOpen
                ? `Opened until ${restaurant.openHours?.split("–")[1]?.trim() ?? "10:00pm"}`
                : "Currently closed"}
            </p>

            {/* extra meta */}
            <div className="rp-left__meta-list">
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon">🛵</span>
                <span>Delivery · {formatNaira(restaurant.deliveryFee)}</span>
              </div>
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon">📋</span>
                <span>Min. order {formatNaira(restaurant.minOrder)}</span>
              </div>
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon">📍</span>
                <span>{restaurant.address}</span>
              </div>
            </div>

            {/* tags */}
            <div className="rp-left__tags">
              {restaurant.tags.map(t => (
                <span key={t} className="rp-tag">{t}</span>
              ))}
            </div>

            {/* actions */}
            <div className="rp-left__actions">
              <button className="rp-action-btn">🤍 Save</button>
              <button className="rp-action-btn">🔗 Share</button>
            </div>
          </div>
        </aside>

        <div className="rp-right" ref={rightPanelRef}>

          {/* sticky search + category tabs */}
          <div className="rp-right__sticky">
            {/* search */}
            <div className="rp-right__search-wrap">
              <svg className="rp-right__search-icon" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="rp-right__search"
                placeholder={`search ${restaurant.name.toLowerCase()}......`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="rp-search__clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            {/* category tabs */}
            <div className="rp-right__tabs">
              {restaurant.categories.map(cat => (
                <button
                  key={cat}
                  className={`rp-right__tab ${activeCategory === cat ? "rp-right__tab--active" : ""}`}
                  onClick={() => scrollToCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* menu sections */}
          <div className="rp-right__menu">
            {categories.map(cat => {
              const items = itemsFor(cat);
              if (!items.length) return null;
              return (
                <section
                  key={cat}
                  id={cat}
                  ref={el => { categoryRefs.current[cat] = el; }}
                  className="rp-section"
                >
                  <h2 className="rp-section__title">{cat}</h2>

                  <div className="rp-list">
                    {items.map(item => {
                      const qty = getCartQty(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`rp-list-item ${!item.available ? "rp-list-item--unavailable" : ""}`}
                          onClick={() => item.available && openModal(item)}
                        >
                          {/* text side */}
                          <div className="rp-list-item__body">
                            <p className="rp-list-item__name">{item.name}</p>
                            <p className="rp-list-item__desc">{item.description}</p>
                            <p className="rp-list-item__price">{formatNaira(item.price)}</p>

                            {/* in-cart badge */}
                            {qty > 0 && (
                              <span className="rp-list-item__in-cart">{qty} in cart</span>
                            )}
                          </div>

                          {/* image + add button */}
                          <div className="rp-list-item__img-wrap">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="rp-list-item__img"
                            />
                            {!item.available && (
                              <div className="rp-list-item__sold-out">Sold out</div>
                            )}
                            {item.available && (
                              <button
                                className="rp-list-item__add"
                                onClick={e => { e.stopPropagation(); openModal(item); }}
                                aria-label={`Add ${item.name}`}
                              >
                                <span className="rp-list-item__add-icon">+</span>
                              </button>
                            )}
                            {/* badges */}
                            {item.popular && (
                              <span className="rp-list-item__badge rp-list-item__badge--popular">🔥</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FLOATING CART BAR
      ══════════════════════════════════════════════════════ */}
      {cartCount > 0 && (
        <div className="rp-cart-bar" onClick={() => setCartOpen(true)}>
          <div className="rp-cart-bar__count">{cartCount}</div>
          <span className="rp-cart-bar__label">View Cart</span>
          <span className="rp-cart-bar__total">{formatNaira(cartTotal)}</span>
        </div>
      )}

      <div
        className={`rp-backdrop ${cartOpen ? "rp-backdrop--visible" : ""}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`rp-cart-drawer ${cartOpen ? "rp-cart-drawer--open" : ""}`}>
        <div className="rp-cart-drawer__header">
          <h3 className="rp-cart-drawer__title">Your Order</h3>
          <button className="rp-cart-drawer__close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="rp-cart-drawer__vendor">
          <span>🏪</span><span>{restaurant.name}</span>
        </div>
        <div className="rp-cart-drawer__items">
          {cart.map(entry => (
            <div key={entry.item.id} className="rp-cart-entry">
              <div className="rp-cart-entry__img-wrap">
                <Image src={entry.item.image} alt={entry.item.name} fill className="object-cover" />
              </div>
              <div className="rp-cart-entry__body">
                <p className="rp-cart-entry__name">{entry.item.name}</p>
                <p className="rp-cart-entry__price">{formatNaira(entry.item.price * entry.qty)}</p>
              </div>
              <div className="rp-stepper rp-stepper--sm">
                <button className="rp-stepper__btn" onClick={() => changeCartQty(entry.item.id, -1)}>−</button>
                <span className="rp-stepper__val">{entry.qty}</span>
                <button className="rp-stepper__btn rp-stepper__btn--plus" onClick={() => changeCartQty(entry.item.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="rp-cart-drawer__summary">
          <div className="rp-cart-drawer__line">
            <span>Subtotal</span><span>{formatNaira(cartTotal)}</span>
          </div>
          <div className="rp-cart-drawer__line">
            <span>Delivery fee</span><span>{formatNaira(restaurant.deliveryFee)}</span>
          </div>
          <div className="rp-cart-drawer__total">
            <span>Total</span>
            <span>{formatNaira(cartTotal + restaurant.deliveryFee)}</span>
          </div>
        </div>
        <Link href="/cart" className="rp-cart-drawer__cta">Go to Cart →</Link>
      </aside>

      {/* ══════════════════════════════════════════════════════
          ITEM MODAL
      ══════════════════════════════════════════════════════ */}
      {modal && (
        <>
          <div className="rp-modal-backdrop" onClick={closeModal} />
          <div className="rp-modal" role="dialog" aria-modal="true" aria-label={modal.item.name}>
            {/* close */}
            <button className="rp-modal__close" onClick={closeModal} aria-label="Close">✕</button>

            {/* hero image */}
            <div className="rp-modal__img-wrap">
              <Image
                src={modal.item.image}
                alt={modal.item.name}
                fill
                className="rp-modal__img"
              />
            </div>

            {/* scrollable body */}
            <div className="rp-modal__body">
              <h2 className="rp-modal__name">{modal.item.name}</h2>
              <p className="rp-modal__desc">{modal.item.description}</p>
              <p className="rp-modal__base-price">
                {formatNaira(modal.item.price)} <span>Per plate</span>
              </p>

              {/* pack options */}
              <div className="rp-modal__section">
                <div className="rp-modal__section-header">
                  <p className="rp-modal__section-title">Pack options</p>
                  <p className="rp-modal__section-sub">select 1</p>
                </div>

                <div className="rp-modal__options">
                  {PACK_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`rp-modal__option ${modal.selectedPack === opt.id ? "rp-modal__option--selected" : ""}`}
                      onClick={() => setModal(m => m ? { ...m, selectedPack: m.selectedPack === opt.id ? null : opt.id } : m)}
                    >
                      <div className={`rp-modal__option-radio ${modal.selectedPack === opt.id ? "rp-modal__option-radio--checked" : ""}`}>
                        {modal.selectedPack === opt.id
                          ? <span className="rp-modal__option-check">✓</span>
                          : <span className="rp-modal__option-plus">+</span>}
                      </div>
                      <span className="rp-modal__option-label">{opt.label}</span>
                      <span className="rp-modal__option-price">{formatNaira(opt.price)}.00</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* sticky footer */}
            <div className="rp-modal__footer">
              {/* qty stepper */}
              <div className="rp-modal__stepper">
                <button
                  className="rp-modal__stepper-btn"
                  onClick={() => setModal(m => m ? { ...m, qty: Math.max(1, m.qty - 1) } : m)}
                  aria-label="Decrease"
                >−</button>
                <span className="rp-modal__stepper-val">{modal.qty}</span>
                <button
                  className="rp-modal__stepper-btn rp-modal__stepper-btn--plus"
                  onClick={() => setModal(m => m ? { ...m, qty: m.qty + 1 } : m)}
                  aria-label="Increase"
                >+</button>
              </div>

              {/* add to cart */}
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