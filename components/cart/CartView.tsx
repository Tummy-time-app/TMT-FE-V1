"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/lib/ProfileContext";
import { useCart } from "@/lib/CartContext";
import { useCreateOrderMutation } from "@/features/orders/ordersApi";
import type { PaymentMethod } from "@/features/orders/types";
import { useGetWalletQuery } from "@/features/rewards/rewardsApi";
import { computeCashback } from "@/features/rewards/constants";
import { normalizeApiError } from "@/lib/utils/apiError";
import { SafeImage } from "@/components/ui/SafeImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { BasketIcon, CheckCircleIcon, CheckIcon, ChevronRightIcon, CloseIcon, PadlockIcon, PencilIcon, StoreIcon, WalletIcon } from "@/components/icons";

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
 *
 * "TummyTime 2.0" redesign: every emoji (🛒✅🏪✕📝🔒) is now a real icon;
 * quantity steppers use the shared QuantityStepper primitive (same one
 * the global CartDrawer uses — components/cart/CartDrawer.tsx); both
 * empty states use the shared EmptyState component instead of bespoke
 * markup; the header is no longer a full-bleed solid-crimson banner —
 * matches the rest of the redesign's "crimson is an accent, not the
 * background" rule (section 27 of the brief).
 */
export function CartView() {
  const { cart, changeQty, removeItem, updateNote, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const { data: wallet } = useGetWalletQuery(user?.id ?? "", { skip: !user });

  const [noteId, setNoteId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ id: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_on_delivery");

  const walletBalance = Number(wallet?.balance ?? 0);
  const canPayWithWallet = walletBalance >= cartTotal;
  const cashbackPreview = computeCashback(cartTotal);

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
      const order = await createOrder({
        customerId: user.id,
        restaurantId: cart.restaurantId,
        items: cart.entries.map((e) => ({
          menuItemId: e.item.id,
          name: e.item.name,
          quantity: e.qty,
          unitPrice: Number(e.item.price),
        })),
        totalAmount: cartTotal,
        paymentMethod,
        deliveryAddress: profile.address.line1
          ? `${profile.address.line1}, ${profile.address.city}`
          : undefined,
        deliveryLat: profile.address.lat,
        deliveryLng: profile.address.lng,
      }).unwrap();
      setPlacedOrder({ id: order.id });
      clearCart();
    } catch (err) {
      setOrderError(normalizeApiError(err as never).message);
    }
  };

  if (placedOrder) {
    return (
      <EmptyState
        icon={CheckCircleIcon}
        title="Order confirmed!"
        // Cashback/loyalty/free-delivery credit on delivery, not at
        // checkout (blueprint screen 34) — the rider app makes "delivered"
        // a real status now, so the reward summary lives on the order's
        // own tracking page instead of here (see OrderDetail.tsx).
        message="We'll let you know when it's on the way. Your rewards will show up here once it's delivered."
        action={
          <Link href={`/orders/${placedOrder.id}`} className="vp-empty-cta">
            Track Order
          </Link>
        }
      />
    );
  }

  if (cart.entries.length === 0) {
    return (
      <EmptyState
        icon={BasketIcon}
        title="Your cart is empty"
        message="Looks like you haven't added anything yet. Let's fix that!"
        action={
          <Link href="/vendors/restaurants" className="vp-empty-cta">
            Browse Restaurants
          </Link>
        }
      />
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
                <SafeImage src={entry.item.imageUrl} alt={entry.item.name} fill className="cart-item__img" />
              </div>

              <div className="cart-item__body">
                <div className="cart-item__top">
                  <div>
                    <p className="cart-item__name">{entry.item.name}</p>
                    <span className="cart-item__vendor">
                      <StoreIcon width={11} height={11} />
                      {cart.restaurantName}
                    </span>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(entry.item.id)}
                    aria-label={`Remove ${entry.item.name}`}
                  >
                    <CloseIcon width={13} height={13} />
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
                    <PencilIcon width={11} height={11} />
                    {entry.note || "Add a note"}
                  </button>
                )}

                <div className="cart-item__foot">
                  <QuantityStepper
                    value={entry.qty}
                    min={0}
                    size="sm"
                    onDecrease={() => changeQty(entry.item.id, -1)}
                    onIncrease={() => changeQty(entry.item.id, 1)}
                  />
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
            <div className="cart-summary__line cart-summary__line--discount">
              <span>You&apos;ll earn</span>
              <span>+{formatNaira(cashbackPreview)} cashback</span>
            </div>
          </div>

          <div className="cart-summary__total">
            <span>Total</span>
            <span>{formatNaira(cartTotal)}</span>
          </div>

          <div className="cart-payment">
            <p className="cart-payment__title">Pay with</p>
            <button
              type="button"
              className={`cart-payment__option ${paymentMethod === "wallet" ? "cart-payment__option--active" : ""} ${!canPayWithWallet ? "cart-payment__option--disabled" : ""}`}
              onClick={() => setPaymentMethod("wallet")}
              disabled={!canPayWithWallet}
            >
              <span className="cart-payment__option-label">
                <span>
                  <WalletIcon width={13} height={13} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                  TummyTime Wallet
                </span>
                <span className="cart-payment__option-balance">Balance: {formatNaira(walletBalance)}</span>
              </span>
              {paymentMethod === "wallet" && <CheckIcon width={16} height={16} />}
            </button>
            {!canPayWithWallet && (
              <p className="cart-payment__topup-hint">
                Not enough balance · <Link href="/wallet" className="cart-payment__topup-link">Top up your wallet</Link>
              </p>
            )}
            <button
              type="button"
              className={`cart-payment__option ${paymentMethod === "pay_on_delivery" ? "cart-payment__option--active" : ""}`}
              onClick={() => setPaymentMethod("pay_on_delivery")}
            >
              <span className="cart-payment__option-label">
                <span>Pay on Delivery</span>
              </span>
              {paymentMethod === "pay_on_delivery" && <CheckIcon width={16} height={16} />}
            </button>
          </div>

          {orderError && <p className="cart-promo__error">{orderError}</p>}

          <button className="cart-checkout" onClick={handleCheckout} disabled={isPlacingOrder}>
            <span>{isPlacingOrder ? "Placing order…" : "Proceed to Checkout"}</span>
            <ChevronRightIcon width={16} height={16} className="cart-checkout__arrow" />
          </button>

          <p className="cart-summary__note">
            <PadlockIcon width={11} height={11} />
            Real order · placed to {cart.restaurantName}
          </p>
        </aside>
      </div>
    </main>
  );
}
