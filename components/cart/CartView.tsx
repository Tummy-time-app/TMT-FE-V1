"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/lib/ProfileContext";
import { useCart } from "@/lib/CartContext";
import { useCreateOrderMutation } from "@/features/orders/ordersApi";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Adapted from the `frontend` branch's app/cart/page.tsx. Reads the real
 * shared cart (lib/CartContext.tsx) instead of the source's static
 * lib/cartData.ts seed array, and a genuinely working checkout —
 * useCreateOrderMutation, the same order-service this session already
 * integrated — instead of the source's "Proceed to Checkout" button,
 * which had no onClick handler at all.
 *
 * Dropped, all fake-data-only in the source:
 *  - the delivery-fee line and the free-delivery-threshold progress bar
 *    (CreateOrderPayload has no delivery-fee concept — see
 *    RestaurantView.tsx's doc comment for the same call on the detail page)
 *  - the "Estimated delivery: 25–35 min" banner (no ETA data anywhere)
 *  - the promo code box (hardcoded to accept exactly "TUMMY10" for a 10%
 *    discount in the source — no coupon/promotion system exists on
 *    TMT-BE-V1 to back this with)
 */
export function CartView() {
  const { cart, changeQty, removeItem, updateNote, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 320);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      setOrderError("Log in to place an order.");
      return;
    }
    if (!cart.restaurantId) return;

    setOrderError(null);
    try {
      await createOrder({
        customerId: user.id,
        restaurantId: cart.restaurantId,
        items: cart.entries.map((e) => ({
          menuItemId: e.item.id,
          name: e.item.name,
          quantity: e.qty,
          unitPrice: Number(e.item.price),
        })),
        totalAmount: cartTotal,
        deliveryAddress: profile.address.line1
          ? `${profile.address.line1}, ${profile.address.city}`
          : undefined,
      }).unwrap();
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setOrderError(normalizeApiError(err as never).message);
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__inner">
          <div className="cart-empty__icon">✅</div>
          <h2 className="cart-empty__heading">Order placed!</h2>
          <p className="cart-empty__sub">We&apos;ll let you know when it&apos;s confirmed.</p>
          <Link href="/vendors/restaurants" className="cart-empty__cta">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  if (cart.entries.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__inner">
          <div className="cart-empty__icon">🛒</div>
          <h2 className="cart-empty__heading">Your cart is empty</h2>
          <p className="cart-empty__sub">
            {`Looks like you haven't added anything yet.`}
            <br />
            {`Let's fix that!`}
          </p>
          <Link href="/vendors/restaurants" className="cart-empty__cta">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-header">
        <div className="cart-header__inner">
          <div>
            <h1 className="cart-header__title">Your Order</h1>
            <p className="cart-header__meta">
              {cart.entries.length} item{cart.entries.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
              <span>{formatNaira(cartTotal)}</span>
            </p>
          </div>
          <button className="cart-header__clear" onClick={clearCart}>
            Clear all
          </button>
        </div>
      </div>

      <div className="cart-body">
        <div className="cart-items">
          {cart.entries.map((entry) => (
            <div
              key={entry.item.id}
              className={`cart-item ${removingId === entry.item.id ? "cart-item--removing" : ""}`}
            >
              <div className="cart-item__img-wrap">
                {entry.item.imageUrl && (
                  <Image src={entry.item.imageUrl} alt={entry.item.name} fill className="cart-item__img" />
                )}
              </div>

              <div className="cart-item__body">
                <div className="cart-item__top">
                  <div>
                    <p className="cart-item__name">{entry.item.name}</p>
                    <span className="cart-item__vendor">🏪 {cart.restaurantName}</span>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(entry.item.id)}
                    aria-label={`Remove ${entry.item.name}`}
                  >
                    ✕
                  </button>
                </div>

                {noteId === entry.item.id ? (
                  <div className="cart-item__note-wrap">
                    <input
                      autoFocus
                      className="cart-item__note-input"
                      placeholder="Any special instructions…"
                      value={entry.note ?? ""}
                      onChange={(e) => updateNote(entry.item.id, e.target.value)}
                      onBlur={() => setNoteId(null)}
                    />
                  </div>
                ) : (
                  <button className="cart-item__note-btn" onClick={() => setNoteId(entry.item.id)}>
                    {entry.note ? `📝 ${entry.note}` : "+ Add a note"}
                  </button>
                )}

                <div className="cart-item__foot">
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => changeQty(entry.item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-item__qty-value">{entry.qty}</span>
                    <button
                      className="cart-item__qty-btn cart-item__qty-btn--plus"
                      onClick={() => changeQty(entry.item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-item__price">{formatNaira(Number(entry.item.price) * entry.qty)}</p>
                </div>
              </div>
            </div>
          ))}

          <Link href={cart.restaurantId ? `/vendors/restaurants/${cart.restaurantId}` : "/vendors/restaurants"} className="cart-add-more">
            <span className="cart-add-more__icon">+</span>
            Add more items
          </Link>
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__lines">
            <div className="cart-summary__line">
              <span>Subtotal</span>
              <span>{formatNaira(cartTotal)}</span>
            </div>
          </div>

          <div className="cart-summary__total">
            <span>Total</span>
            <span>{formatNaira(cartTotal)}</span>
          </div>

          {orderError && <p className="cart-promo__error">{orderError}</p>}

          <button className="cart-checkout" onClick={handleCheckout} disabled={isPlacingOrder}>
            <span>{isPlacingOrder ? "Placing order…" : "Proceed to Checkout"}</span>
            <span className="cart-checkout__arrow">→</span>
          </button>

          <p className="cart-summary__note">🔒 Real order · placed to {cart.restaurantName}</p>
        </aside>
      </div>
    </main>
  );
}
