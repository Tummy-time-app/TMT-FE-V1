"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const DELIVERY_FEE = 500;

function formatNaira(n: number) {
  return `\u20A6${n.toLocaleString("en-NG")}`;
}

/* ── Main checkout content ─────────────────────────────── */
function CheckoutContent() {
  const params = useSearchParams();
  const vendorId = params.get("vendor") ?? "";
  const initialType = (params.get("type") as "delivery" | "pickup") ?? "delivery";
  const riderNote = params.get("note") ?? "";

  const { items } = useCart();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">(initialType);

  /* If a vendor is specified, show only that vendor's items; otherwise show all */
  const checkoutItems = vendorId
    ? items.filter(i => i.vendorId === vendorId)
    : items;

  const vendorName = checkoutItems.length > 0 ? checkoutItems[0].vendor : "vendor";
  const backHref = vendorId ? `/vendors/restaurants/${vendorId}` : "/cart";

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

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
              <div className="co-address__badge">Pre-assigned for delivery</div>
              <div className="co-address__row">
                <span className="co-address__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <p className="co-address__label">Delivery address</p>
                  <p className="co-address__value">23 Awolowo Road, Ikoyi Lagos</p>
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
              <label className="co-payment__option co-payment__option--active">
                <input type="radio" name="payment" defaultChecked className="co-payment__radio" />
                <span className="co-payment__option-icon">💳</span>
                <span>Pay on delivery</span>
              </label>
              <label className="co-payment__option">
                <input type="radio" name="payment" className="co-payment__radio" />
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

          <button className="co-summary__cta">
            Place Order &mdash; {formatNaira(total)}
          </button>

          <p className="co-summary__note">
            By placing this order, you agree to our terms & conditions.
          </p>
        </aside>
      </div>
    </main>
  );
}

/* ── Page wrapper with Suspense (for useSearchParams) ── */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="co-page" style={{ minHeight: "60vh" }} />}>
      <CheckoutContent />
    </Suspense>
  );
}
