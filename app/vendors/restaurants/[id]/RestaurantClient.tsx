"use client";
import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { notFound } from "next/navigation";
import { useGetVendorDetailQuery } from "@/features/vendors/vendorsApi";
import type { MenuItem, VendorDetail } from "@/features/vendors/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Map } from "@/components/maps/Map";
import { VendorMarker } from "@/components/maps/VendorMarker";
import { StarSolid, Bike, ClipboardList, MapPin, Heart, Share, X, Flame, Store, Check } from "@/components/icons";

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
  id: string;
}

function VendorDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-black/5" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-black/5" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-black/5" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-black/5" />
      </div>
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-full bg-black/5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-black/5" />
        ))}
      </div>
    </div>
  );
}

export function RestaurantClient({ id }: Props) {
  const { data, isLoading, error, refetch } = useGetVendorDetailQuery(id);

  if (isLoading) return <VendorDetailSkeleton />;

  if (error) {
    if (normalizeApiError(error).status === 404) notFound();
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!data) return null;

  return <RestaurantDetail data={data} />;
}

function RestaurantDetail({ data }: { data: VendorDetail }) {
  const { restaurant, menuItems: allItems } = data;
  const { items: cartItems, addItem, changeQty, getItemQty } = useCart();

  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0] ?? "");
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<ModalState | null>(null);
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [riderNote, setRiderNote] = useState("");
  const [showRiderNote, setShowRiderNote] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement>(null);

  /* ── Cart items for this vendor ────────────────────────── */
  const vendorCart = cartItems.filter(i => i.vendorId === restaurant.id);
  const vendorTotal = vendorCart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (item: MenuItem, qty: number) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      vendor: restaurant.name,
      vendorId: restaurant.id,
      price: item.price,
      image: item.image,
    }, qty);
  };

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
                <span className="rp-left__rating-star"><StarSolid size={13} aria-hidden /></span>
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
                <span className="rp-left__meta-icon"><Bike size={15} aria-hidden /></span>
                <span>Delivery · {formatNaira(restaurant.deliveryFee)}</span>
              </div>
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon"><ClipboardList size={15} aria-hidden /></span>
                <span>Min. order {formatNaira(restaurant.minOrder)}</span>
              </div>
              <div className="rp-left__meta-row">
                <span className="rp-left__meta-icon"><MapPin size={15} aria-hidden /></span>
                <span>{restaurant.address}</span>
              </div>
            </div>

            {/* location */}
            <div className="my-1 overflow-hidden rounded-lg">
              <Map center={restaurant.location} zoom={15} height={140}>
                <VendorMarker position={restaurant.location} />
              </Map>
            </div>

            {/* tags */}
            <div className="rp-left__tags">
              {restaurant.tags.map(t => (
                <span key={t} className="rp-tag">{t}</span>
              ))}
            </div>

            {/* actions */}
            <div className="rp-left__actions">
              <button className="rp-action-btn"><Heart size={14} aria-hidden style={{ verticalAlign: -2 }} /> Save</button>
              <button className="rp-action-btn"><Share size={14} aria-hidden style={{ verticalAlign: -2 }} /> Share</button>
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
                <button className="rp-search__clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={12} aria-hidden /></button>
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
                      const qty = getItemQty(item.id);
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
                              <span className="rp-list-item__badge rp-list-item__badge--popular"><Flame size={13} aria-hidden /></span>
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
      {vendorCart.length > 0 && (
        <div className="rp-cart-bar" onClick={() => setCartOpen(true)}>
          <div className="rp-cart-bar__count">{vendorCart.reduce((s, i) => s + i.qty, 0)}</div>
          <span className="rp-cart-bar__label">View Cart</span>
          <span className="rp-cart-bar__total">{formatNaira(vendorTotal)}</span>
        </div>
      )}

      <div
        className={`rp-backdrop ${cartOpen ? "rp-backdrop--visible" : ""}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`rp-cart-drawer ${cartOpen ? "rp-cart-drawer--open" : ""}`}>
        <div className="rp-cart-drawer__header">
          <h3 className="rp-cart-drawer__title">Your Order</h3>
          <button className="rp-cart-drawer__close" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={14} aria-hidden /></button>
        </div>
        <div className="rp-cart-drawer__vendor">
          <span><Store size={14} aria-hidden /></span><span>{restaurant.name}</span>
        </div>

        {/* Delivery / Pickup toggle */}
        <div className="rp-cart-drawer__toggle">
          <button
            className={`rp-cart-drawer__toggle-btn ${orderType === "delivery" ? "rp-cart-drawer__toggle-btn--active" : ""}`}
            onClick={() => setOrderType("delivery")}
          >
            Delivery
          </button>
          <button
            className={`rp-cart-drawer__toggle-btn ${orderType === "pickup" ? "rp-cart-drawer__toggle-btn--active" : ""}`}
            onClick={() => setOrderType("pickup")}
          >
            Pickup
          </button>
        </div>

        <div className="rp-cart-drawer__items">
          {vendorCart.map(entry => (
            <div key={entry.id} className="rp-cart-entry">
              <div className="rp-cart-entry__img-wrap">
                <Image src={entry.image} alt={entry.name} fill className="object-cover" />
              </div>
              <div className="rp-cart-entry__body">
                <p className="rp-cart-entry__name">{entry.name}</p>
                <p className="rp-cart-entry__price">{formatNaira(entry.price * entry.qty)}</p>
              </div>
              <div className="rp-stepper rp-stepper--sm">
                <button className="rp-stepper__btn" onClick={() => changeQty(entry.id, -1)} aria-label={`Decrease ${entry.name} quantity`}>−</button>
                <span className="rp-stepper__val">{entry.qty}</span>
                <button className="rp-stepper__btn rp-stepper__btn--plus" onClick={() => changeQty(entry.id, 1)} aria-label={`Increase ${entry.name} quantity`}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Rider note */}
        <div className="rp-cart-drawer__note-section">
          <label className="rp-cart-drawer__note-toggle">
            <input
              type="checkbox"
              checked={showRiderNote}
              onChange={() => setShowRiderNote(!showRiderNote)}
              className="rp-cart-drawer__note-check"
            />
            <span>Leave a note for the rider</span>
          </label>
          {showRiderNote && (
            <textarea
              className="rp-cart-drawer__note-input"
              placeholder="E.g. Please call when you arrive..."
              value={riderNote}
              onChange={e => setRiderNote(e.target.value)}
              rows={2}
            />
          )}
        </div>

        <div className="rp-cart-drawer__summary">
          <div className="rp-cart-drawer__line">
            <span>Subtotal</span><span>{formatNaira(vendorTotal)}</span>
          </div>
          {orderType === "delivery" && (
            <div className="rp-cart-drawer__line">
              <span>Delivery fee</span><span>{formatNaira(restaurant.deliveryFee)}</span>
            </div>
          )}
          <div className="rp-cart-drawer__total">
            <span>Total</span>
            <span>{formatNaira(vendorTotal + (orderType === "delivery" ? restaurant.deliveryFee : 0))}</span>
          </div>
        </div>

        <div className="rp-cart-drawer__actions">
          <Link
            href={`/checkout?vendor=${restaurant.id}&type=${orderType}${riderNote ? `&note=${encodeURIComponent(riderNote)}` : ""}`}
            className="rp-cart-drawer__cta"
          >
            Checkout to {orderType}
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          ITEM MODAL
      ══════════════════════════════════════════════════════ */}
      {modal && (
        <>
          <div className="rp-modal-backdrop" onClick={closeModal} />
          <div className="rp-modal" role="dialog" aria-modal="true" aria-label={modal.item.name}>
            {/* close */}
            <button className="rp-modal__close" onClick={closeModal} aria-label="Close"><X size={16} aria-hidden /></button>

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
                          ? <span className="rp-modal__option-check"><Check size={11} aria-hidden /></span>
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