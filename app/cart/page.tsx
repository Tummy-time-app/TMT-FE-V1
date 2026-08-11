"use client";
import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useValidatePromoCodeMutation } from "@/features/promotions/promotionsApi";
import { normalizeApiError } from "@/lib/utils/apiError";
import { ShoppingCart, Store, X, Pencil, Zap, Tag, PartyPopper, Lock } from "@/components/icons";

const DELIVERY_FEE = 500;
const FREE_DELIVERY_THRESHOLD = 10000;

/* ── Helpers ─────────────────────────────────────────────── */
function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/* ── Component ───────────────────────────────────────────── */
export default function CartPage() {
  const {
    items,
    cartTotal: subtotal,
    changeQty,
    removeItem,
    updateNote,
    clearCart,
    appliedPromo,
    applyPromo: setAppliedPromo,
    removePromo,
  } = useCart();
  const [promo, setPromo]           = useState("");
  const [promoError, setPromoError] = useState("");
  const [noteId, setNoteId]         = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [validatePromoCode, { isLoading: isValidatingPromo }] = useValidatePromoCodeMutation();

  /* calculations */
  const discount   = appliedPromo?.discountAmount ?? 0;
  const delivery   = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total      = subtotal - discount + delivery;

  /* actions */
  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 320);
  };

  const handleApplyPromo = async () => {
    setPromoError("");
    try {
      const result = await validatePromoCode({ code: promo, vendorId: items[0]?.vendorId, subtotal }).unwrap();
      setAppliedPromo({ code: result.promotion.code, discountAmount: result.discountAmount });
    } catch (err) {
      setPromoError(normalizeApiError(err as never).message);
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromo("");
    setPromoError("");
  };

  /* ── Empty state ──────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__inner">
          <div className="cart-empty__icon"><ShoppingCart size={36} aria-hidden /></div>
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
            onClick={() => clearCart()}
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
                      <Store size={12} aria-hidden style={{ verticalAlign: -2 }} /> Restaurant &nbsp;·&nbsp; {item.vendor}
                    </span>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={13} aria-hidden />
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
                    {item.note ? (
                      <>
                        <Pencil size={12} aria-hidden style={{ verticalAlign: -2 }} /> {item.note}
                      </>
                    ) : (
                      "+ Add a note"
                    )}
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
            <span className="cart-eta__icon"><Zap size={18} aria-hidden /></span>
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
            {appliedPromo && (
              <div className="cart-summary__line cart-summary__line--discount">
                <span>Promo ({appliedPromo.code})</span>
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
            <div className={`cart-promo__wrap ${promoError ? "cart-promo__wrap--error" : ""} ${appliedPromo ? "cart-promo__wrap--success" : ""}`}>
              <span className="cart-promo__icon"><Tag size={15} aria-hidden /></span>
              <input
                className="cart-promo__input"
                placeholder="Promo code"
                value={promo}
                onChange={e => {
                  setPromo(e.target.value);
                  setPromoError("");
                }}
                disabled={!!appliedPromo}
              />
              {appliedPromo ? (
                <button
                  className="cart-promo__btn cart-promo__btn--remove"
                  onClick={handleRemovePromo}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="cart-promo__btn"
                  onClick={handleApplyPromo}
                  disabled={!promo.trim() || isValidatingPromo}
                >
                  {isValidatingPromo ? "Checking…" : "Apply"}
                </button>
              )}
            </div>
            {promoError && (
              <p className="cart-promo__error">{promoError}</p>
            )}
            {appliedPromo && (
              <p className="cart-promo__success">
                <PartyPopper size={13} aria-hidden style={{ verticalAlign: -2 }} /> {appliedPromo.code} applied — you saved {formatNaira(discount)}!
              </p>
            )}
          </div>

          {/* total */}
          <div className="cart-summary__total">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          {/* checkout CTA */}
          <Link href="/checkout" className="cart-checkout">
            <span>Proceed to Checkout</span>
            <span className="cart-checkout__arrow">→</span>
          </Link>

          <p className="cart-summary__note">
            <Lock size={12} aria-hidden style={{ verticalAlign: -2 }} /> Secure checkout &nbsp;·&nbsp; Pay on delivery available
          </p>
        </aside>
      </div>

    </main>
  );
}
