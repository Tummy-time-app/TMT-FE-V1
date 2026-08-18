"use client";
import { CartItem, initialItems } from "@/lib/cartData";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const DELIVERY_FEE = 500;
const FREE_DELIVERY_THRESHOLD = 10000;

const vendorTypeLabel: Record<CartItem["vendorType"], string> = {
  restaurant: "🏪 Restaurant",
  shop: "🛒 Shop",
  market: "🌿 Market",
};

/* ── Helpers ─────────────────────────────────────────────── */
function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/* ── Component ───────────────────────────────────────────── */
export default function CartPage() {
  const [items, setItems]           = useState<CartItem[]>(initialItems);
  const [promo, setPromo]           = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [noteId, setNoteId]         = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  /* calculations */
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount   = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery   = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total      = subtotal - discount + delivery;

  /* actions */
  const changeQty = (id: number, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      setRemovingId(null);
    }, 320);
  };

  const updateNote = (id: number, note: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, note } : i));
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "TUMMY10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  /* ── Empty state ──────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__inner">
          <div className="cart-empty__icon">🛒</div>
          <h2 className="cart-empty__heading">Your cart is empty</h2>
          <p className="cart-empty__sub">
            {`Looks like you haven't added anything yet.`}
            <br />{`Let's fix that!`}
          </p>
          <Link href="/" className="cart-empty__cta">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="cart-page">

      {/* ── Page header ───────────────────────────────── */}
      <div className="cart-header">
        <div className="cart-header__inner">
          <div>
            <h1 className="cart-header__title">Your Order</h1>
            <p className="cart-header__meta">
              {items.length} item{items.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
              <span>{formatNaira(subtotal)}</span>
            </p>
          </div>
          <button
            className="cart-header__clear"
            onClick={() => setItems([])}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────── */}
      <div className="cart-body">

        {/* LEFT — item list */}
        <div className="cart-items">
          {items.map(item => (
            <div
              key={item.id}
              className={`cart-item ${removingId === item.id ? "cart-item--removing" : ""}`}
            >
              {/* image */}
              <div className="cart-item__img-wrap">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="cart-item__img"
                />
              </div>

              {/* details */}
              <div className="cart-item__body">
                <div className="cart-item__top">
                  <div>
                    <p className="cart-item__name">{item.name}</p>
                    <span className="cart-item__vendor">
                      {vendorTypeLabel[item.vendorType]} &nbsp;·&nbsp; {item.vendor}
                    </span>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>

                {/* note */}
                {noteId === item.id ? (
                  <div className="cart-item__note-wrap">
                    <input
                      autoFocus
                      className="cart-item__note-input"
                      placeholder="Any special instructions…"
                      value={item.note ?? ""}
                      onChange={e => updateNote(item.id, e.target.value)}
                      onBlur={() => setNoteId(null)}
                    />
                  </div>
                ) : (
                  <button
                    className="cart-item__note-btn"
                    onClick={() => setNoteId(item.id)}
                  >
                    {item.note
                      ? `📝 ${item.note}`
                      : "+ Add a note"}
                  </button>
                )}

                {/* qty + price row */}
                <div className="cart-item__foot">
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="cart-item__qty-value">{item.qty}</span>
                    <button
                      className="cart-item__qty-btn cart-item__qty-btn--plus"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <p className="cart-item__price">
                    {formatNaira(item.price * item.qty)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* add more */}
          <Link href="/" className="cart-add-more">
            <span className="cart-add-more__icon">+</span>
            Add more items
          </Link>
        </div>

        {/* RIGHT — order summary */}
        <aside className="cart-summary">

          {/* delivery estimate banner */}
          <div className="cart-eta">
            <span className="cart-eta__icon">⚡</span>
            <div>
              <p className="cart-eta__label">Estimated delivery</p>
              <p className="cart-eta__time">25 – 35 min</p>
            </div>
            <div className="cart-eta__badge">Fast</div>
          </div>

          <h2 className="cart-summary__title">Order Summary</h2>

          {/* line items */}
          <div className="cart-summary__lines">
            <div className="cart-summary__line">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="cart-summary__line">
              <span>
                Delivery fee
                {delivery === 0 && (
                  <span className="cart-summary__free-tag">FREE</span>
                )}
              </span>
              <span className={delivery === 0 ? "cart-summary__struck" : ""}>
                {formatNaira(DELIVERY_FEE)}
              </span>
            </div>
            {promoApplied && (
              <div className="cart-summary__line cart-summary__line--discount">
                <span>Promo (TUMMY10)</span>
                <span>− {formatNaira(discount)}</span>
              </div>
            )}

            {/* free delivery progress */}
            {delivery > 0 && (
              <div className="cart-free-progress">
                <div className="cart-free-progress__track">
                  <div
                    className="cart-free-progress__fill"
                    style={{
                      width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="cart-free-progress__label">
                  Add <strong>{formatNaira(FREE_DELIVERY_THRESHOLD - subtotal)}</strong> more for free delivery
                </p>
              </div>
            )}
          </div>

          {/* promo code */}
          <div className="cart-promo">
            <div className={`cart-promo__wrap ${promoError ? "cart-promo__wrap--error" : ""} ${promoApplied ? "cart-promo__wrap--success" : ""}`}>
              <span className="cart-promo__icon">🏷️</span>
              <input
                className="cart-promo__input"
                placeholder="Promo code"
                value={promo}
                onChange={e => {
                  setPromo(e.target.value);
                  setPromoError(false);
                }}
                disabled={promoApplied}
              />
              {promoApplied ? (
                <button
                  className="cart-promo__btn cart-promo__btn--remove"
                  onClick={() => { setPromoApplied(false); setPromo(""); }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="cart-promo__btn"
                  onClick={applyPromo}
                  disabled={!promo.trim()}
                >
                  Apply
                </button>
              )}
            </div>
            {promoError && (
              <p className="cart-promo__error">Invalid promo code. Try TUMMY10</p>
            )}
            {promoApplied && (
              <p className="cart-promo__success">🎉 10% discount applied!</p>
            )}
          </div>

          {/* total */}
          <div className="cart-summary__total">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          {/* checkout CTA */}
          <button className="cart-checkout">
            <span>Proceed to Checkout</span>
            <span className="cart-checkout__arrow">→</span>
          </button>

          <p className="cart-summary__note">
            🔒 Secure checkout &nbsp;·&nbsp; Pay on delivery available
          </p>
        </aside>
      </div>

    </main>
  );
}