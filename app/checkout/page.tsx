"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useCreateOrderMutation } from "@/features/orders/ordersApi";
import type { PaymentMethod } from "@/features/orders/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { useToast } from "@/components/feedback/ToastProvider";

const DELIVERY_FEE = 500;
const PICKUP_ADDRESS_NOTE = "Pre-assigned for delivery";
const DELIVERY_ADDRESS = "23 Awolowo Road, Ikoyi Lagos";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/* ── Main checkout content ─────────────────────────────── */
function CheckoutContent() {
  const params = useSearchParams();
  const vendorIdParam = params.get("vendor") ?? "";
  const initialType = (params.get("type") as "delivery" | "pickup") ?? "delivery";
  const riderNote = params.get("note") ?? "";

  const { items, clearCart } = useCart();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">(initialType);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const toast = useToast();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  /* Group cart items by vendor — an order can only include one vendor. */
  const vendorIds = useMemo(() => Array.from(new Set(items.map((i) => i.vendorId))), [items]);
  const resolvedVendorId = vendorIdParam || vendorIds[0] || "";
  const checkoutItems = resolvedVendorId ? items.filter((i) => i.vendorId === resolvedVendorId) : items;
  const hasOtherVendorItems = !vendorIdParam && vendorIds.length > 1;

  const vendorName = checkoutItems.length > 0 ? checkoutItems[0].vendor : "vendor";
  const backHref = resolvedVendorId ? `/vendors/restaurants/${resolvedVendorId}` : "/cart";

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = async () => {
    setSubmitError("");
    try {
      const order = await createOrder({
        vendorId: resolvedVendorId,
        vendorName,
        items: checkoutItems.map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image,
          price: i.price,
          qty: i.qty,
          note: i.note,
        })),
        orderType,
        deliveryAddress: orderType === "delivery" ? DELIVERY_ADDRESS : undefined,
        riderNote: riderNote || undefined,
        paymentMethod,
        subtotal,
        deliveryFee: delivery,
        total,
      }).unwrap();

      clearCart();
      toast.success("Order placed! Tracking it now…");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setSubmitError(normalizeApiError(err as never).message);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <main className="co-page">
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <p style={{ fontSize: "1.1rem", color: "#888", marginBottom: "20px" }}>No items to checkout</p>
          <Link href="/" style={{ color: "var(--crimson)", fontWeight: 700 }}>Browse Restaurants</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="co-page">
      {/* Back link */}
      <Link href={backHref} className="co-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to vendor
      </Link>

      {hasOtherVendorItems && (
        <div className="co-vendor-notice">
          Your cart has items from other vendors too — orders can only include one vendor at a time, so only{" "}
          <strong>{vendorName}</strong> items are included here. <Link href="/cart">Manage your cart</Link>
        </div>
      )}

      <div className="co-layout">
        {/* ── LEFT: Checkout form ──────────────────────── */}
        <section className="co-form">
          <h1 className="co-form__title">Checkout</h1>

          {/* Delivery / Pickup toggle */}
          <div className="co-toggle">
            <button
              className={`co-toggle__btn ${orderType === "delivery" ? "co-toggle__btn--active" : ""}`}
              onClick={() => setOrderType("delivery")}
            >
              Delivery
            </button>
            <button
              className={`co-toggle__btn ${orderType === "pickup" ? "co-toggle__btn--active" : ""}`}
              onClick={() => setOrderType("pickup")}
            >
              Pick up
            </button>
          </div>

          {/* Delivery address / Pickup info */}
          {orderType === "delivery" ? (
            <div className="co-address">
              <div className="co-address__badge">{PICKUP_ADDRESS_NOTE}</div>
              <div className="co-address__row">
                <span className="co-address__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <p className="co-address__label">Delivery address</p>
                  <p className="co-address__value">{DELIVERY_ADDRESS}</p>
                </div>
                <button className="co-address__change">Change</button>
              </div>

              {riderNote && (
                <div className="co-address__note">
                  <span className="co-address__note-icon">📝</span>
                  <span>{riderNote}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="co-address">
              <div className="co-address__badge co-address__badge--pickup">Pickup location</div>
              <div className="co-address__row">
                <span className="co-address__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <div>
                  <p className="co-address__label">Pick up from</p>
                  <p className="co-address__value">{vendorName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="co-items">
            <h2 className="co-items__title">Your items</h2>
            {checkoutItems.map(item => (
              <div key={item.id} className="co-item">
                <div className="co-item__img-wrap">
                  <Image src={item.image} alt={item.name} fill className="co-item__img" />
                </div>
                <div className="co-item__body">
                  <p className="co-item__name">{item.name}</p>
                  <p className="co-item__desc">{item.description}</p>
                </div>
                <div className="co-item__meta">
                  <span className="co-item__qty">x{item.qty}</span>
                  <span className="co-item__price">{formatNaira(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment section */}
          <div className="co-payment">
            <h2 className="co-payment__title">Payment method</h2>
            <div className="co-payment__options">
              <label className={`co-payment__option ${paymentMethod === "cash_on_delivery" ? "co-payment__option--active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  className="co-payment__radio"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => setPaymentMethod("cash_on_delivery")}
                />
                <span className="co-payment__option-icon">💳</span>
                <span>Pay on delivery</span>
              </label>
              <label className={`co-payment__option ${paymentMethod === "bank_transfer" ? "co-payment__option--active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  className="co-payment__radio"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                <span className="co-payment__option-icon">🏦</span>
                <span>Bank transfer</span>
              </label>
            </div>
          </div>
        </section>

        {/* ── RIGHT: Order summary ─────────────────────── */}
        <aside className="co-summary">
          <h2 className="co-summary__title">Order summary</h2>

          <div className="co-summary__lines">
            <div className="co-summary__line">
              <span>Subtotal ({checkoutItems.length} items)</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            {orderType === "delivery" && (
              <div className="co-summary__line">
                <span>Delivery fee</span>
                <span>{formatNaira(delivery)}</span>
              </div>
            )}
          </div>

          <div className="co-summary__total">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          <button className="co-summary__cta" onClick={handlePlaceOrder} disabled={isLoading}>
            {isLoading ? (
              <span className="co-summary__cta-spinner" />
            ) : (
              <>Place Order &mdash; {formatNaira(total)}</>
            )}
          </button>

          {submitError && <p className="co-summary__error">{submitError}</p>}

          <p className="co-summary__note">
            By placing this order, you agree to our terms & conditions.
          </p>
        </aside>
      </div>
    </main>
  );
}

/* ── Page wrapper with Suspense (for useSearchParams) + auth gate ── */
export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="co-page" style={{ minHeight: "60vh" }} />}>
        <CheckoutContent />
      </Suspense>
    </RequireAuth>
  );
}
