"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useCreateOrderMutation } from "@/features/orders/ordersApi";
import { useGetWalletQuery } from "@/features/wallet/walletApi";
import { useGetAddressesQuery } from "@/features/addresses/addressesApi";
import { formatAddressLine } from "@/features/addresses/types";
import type { PaymentMethod } from "@/features/orders/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { useToast } from "@/components/feedback/ToastProvider";
import { Pencil, CreditCard, Cash, Bank, Wallet as WalletIcon, MapPin, Plus, Clock, CalendarDays } from "@/components/icons";
import { formatCartQty } from "@/lib/utils/quantity";
import type { VendorBusinessType } from "@/features/vendors/types";

const DELIVERY_FEE = 500;
const PICKUP_ADDRESS_NOTE = "Pre-assigned for delivery";
const LISTING_ROUTE: Record<VendorBusinessType, string> = {
  restaurant: "/vendors/restaurants",
  shop: "/vendors/shops",
  market: "/vendors/markets",
};

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Earliest a scheduled order can be set for — 30 min out, formatted for a `datetime-local` input's `min` attribute. */
function minScheduleValue() {
  const d = new Date(Date.now() + 30 * 60 * 1000);
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}

/* ── Main checkout content ─────────────────────────────── */
function CheckoutContent() {
  const params = useSearchParams();
  const vendorIdParam = params.get("vendor") ?? "";
  const initialType = (params.get("type") as "delivery" | "pickup") ?? "delivery";
  // Grocery orders (shop/market) carry a substitutions preference from the store
  // page's cart drawer — folded straight into the existing rider-note plumbing
  // rather than adding a parallel field end-to-end.
  const substitutesParam = params.get("substitutes");
  const substituteText =
    substitutesParam === "0" ? "Do not substitute unavailable items." :
    substitutesParam === "1" ? "Substitutions OK if an item is unavailable." : "";
  const riderNote = [params.get("note") ?? "", substituteText].filter(Boolean).join(" ");

  const { items, clearCart, appliedPromo } = useCart();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">(initialType);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [when, setWhen] = useState<"now" | "scheduled">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: wallet } = useGetWalletQuery(user?.id ?? "", { skip: !user });
  const { data: addresses } = useGetAddressesQuery(user?.id ?? "", { skip: !user });

  const selectedAddress =
    addresses?.find((a) => a.id === selectedAddressId) ?? addresses?.find((a) => a.isDefault) ?? addresses?.[0] ?? null;

  /* Group cart items by vendor — an order can only include one vendor. */
  const vendorIds = useMemo(() => Array.from(new Set(items.map((i) => i.vendorId))), [items]);
  const resolvedVendorId = vendorIdParam || vendorIds[0] || "";
  const checkoutItems = resolvedVendorId ? items.filter((i) => i.vendorId === resolvedVendorId) : items;
  const hasOtherVendorItems = !vendorIdParam && vendorIds.length > 1;

  const vendorName = checkoutItems.length > 0 ? checkoutItems[0].vendor : "vendor";
  const vendorBusinessType = checkoutItems[0]?.vendorBusinessType ?? "restaurant";
  const backHref = resolvedVendorId ? `${LISTING_ROUTE[vendorBusinessType]}/${resolvedVendorId}` : "/cart";

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = orderType === "delivery" ? DELIVERY_FEE : 0;
  const discount = appliedPromo?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (orderType === "delivery" && !selectedAddress) {
      setSubmitError("Add a delivery address before placing this order.");
      return;
    }
    if (when === "scheduled" && !scheduledFor) {
      setSubmitError("Choose a date and time for your scheduled order.");
      return;
    }
    setSubmitError("");
    try {
      const order = await createOrder({
        customerId: user.id,
        customerName: user.name,
        vendorId: resolvedVendorId,
        vendorName,
        items: checkoutItems.map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image,
          price: i.price,
          qty: i.qty,
          note: i.note,
          unitType: i.unitType,
          weightUnit: i.weightUnit,
        })),
        orderType,
        deliveryAddress: orderType === "delivery" && selectedAddress ? formatAddressLine(selectedAddress) : undefined,
        deliveryLocation:
          orderType === "delivery" && selectedAddress ? { lat: selectedAddress.lat, lng: selectedAddress.lng } : undefined,
        riderNote: riderNote || undefined,
        paymentMethod,
        scheduledFor: when === "scheduled" && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        promoCode: appliedPromo?.code,
        discount: discount || undefined,
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

          {/* Now / Schedule toggle */}
          <div className="co-toggle" style={{ marginTop: 12 }}>
            <button
              type="button"
              className={`co-toggle__btn ${when === "now" ? "co-toggle__btn--active" : ""}`}
              onClick={() => setWhen("now")}
            >
              <Clock size={13} aria-hidden style={{ verticalAlign: -2, marginRight: 4 }} />
              Now
            </button>
            <button
              type="button"
              className={`co-toggle__btn ${when === "scheduled" ? "co-toggle__btn--active" : ""}`}
              onClick={() => setWhen("scheduled")}
            >
              <CalendarDays size={13} aria-hidden style={{ verticalAlign: -2, marginRight: 4 }} />
              Schedule
            </button>
          </div>

          {when === "scheduled" && (
            <input
              type="datetime-local"
              value={scheduledFor}
              min={minScheduleValue()}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="co-schedule-input"
              style={{
                marginTop: 8,
                width: "100%",
                borderRadius: 10,
                border: "1.5px solid var(--neutral-line, rgba(0,0,0,0.12))",
                background: "#fff",
                padding: "10px 14px",
                fontSize: "0.85rem",
                color: "var(--text-dark)",
              }}
            />
          )}

          {/* Delivery address / Pickup info */}
          {orderType === "delivery" ? (
            <div className="co-address" style={{ position: "relative" }}>
              <div className="co-address__badge">{PICKUP_ADDRESS_NOTE}</div>
              <div className="co-address__row">
                <span className="co-address__icon">
                  <MapPin size={16} aria-hidden style={{ color: "var(--crimson)" }} />
                </span>
                <div>
                  <p className="co-address__label">Delivery address</p>
                  <p className="co-address__value">
                    {selectedAddress ? `${selectedAddress.label} — ${formatAddressLine(selectedAddress)}` : "No address saved yet"}
                  </p>
                </div>
                <button type="button" className="co-address__change" onClick={() => setAddressPickerOpen((v) => !v)}>
                  Change
                </button>
              </div>

              {addressPickerOpen && (
                <div
                  style={{
                    marginTop: 10,
                    borderRadius: 12,
                    border: "1px solid var(--neutral-line, rgba(0,0,0,0.1))",
                    background: "#fff",
                    boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.1))",
                    overflow: "hidden",
                  }}
                >
                  {addresses && addresses.length > 0 ? (
                    addresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(a.id);
                          setAddressPickerOpen(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          border: "none",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          background: a.id === selectedAddress?.id ? "rgba(172,0,0,0.05)" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <MapPin size={14} aria-hidden style={{ color: "var(--crimson)", flexShrink: 0 }} />
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-dark)" }}>
                            {a.label}
                          </span>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#888" }}>{formatAddressLine(a)}</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p style={{ padding: "12px 14px", fontSize: "0.8rem", color: "#888" }}>No saved addresses yet.</p>
                  )}
                  <Link
                    href="/addresses"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--crimson)",
                      textDecoration: "none",
                    }}
                  >
                    <Plus size={13} aria-hidden />
                    Add new address
                  </Link>
                </div>
              )}

              {riderNote && (
                <div className="co-address__note">
                  <span className="co-address__note-icon"><Pencil size={13} aria-hidden /></span>
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
                  <span className="co-item__qty">{formatCartQty(item)}</span>
                  <span className="co-item__price">{formatNaira(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment section */}
          <div className="co-payment">
            <h2 className="co-payment__title">Payment method</h2>
            <div className="co-payment__options">
              <label className={`co-payment__option ${paymentMethod === "card" ? "co-payment__option--active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  className="co-payment__radio"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span className="co-payment__option-icon"><CreditCard size={18} aria-hidden /></span>
                <span>Card</span>
              </label>
              <label className={`co-payment__option ${paymentMethod === "cash_on_delivery" ? "co-payment__option--active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  className="co-payment__radio"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => setPaymentMethod("cash_on_delivery")}
                />
                <span className="co-payment__option-icon"><Cash size={18} aria-hidden /></span>
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
                <span className="co-payment__option-icon"><Bank size={18} aria-hidden /></span>
                <span>Bank transfer</span>
              </label>
              <label
                className={`co-payment__option ${paymentMethod === "wallet" ? "co-payment__option--active" : ""} ${
                  (wallet?.balance ?? 0) < total ? "co-payment__option--disabled" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="co-payment__radio"
                  checked={paymentMethod === "wallet"}
                  disabled={(wallet?.balance ?? 0) < total}
                  onChange={() => setPaymentMethod("wallet")}
                />
                <span className="co-payment__option-icon"><WalletIcon size={18} aria-hidden /></span>
                <span>
                  Wallet
                  <span className="co-payment__balance">
                    {" "}
                    — {formatNaira(wallet?.balance ?? 0)} available
                    {(wallet?.balance ?? 0) < total && " (insufficient)"}
                  </span>
                </span>
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
            {appliedPromo && (
              <div className="co-summary__line">
                <span>Promo ({appliedPromo.code})</span>
                <span>− {formatNaira(discount)}</span>
              </div>
            )}
          </div>

          <div className="co-summary__total">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          <button
            className="co-summary__cta"
            onClick={handlePlaceOrder}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? "Placing order…" : undefined}
          >
            {isLoading ? (
              <span className="co-summary__cta-spinner" />
            ) : (
              <>Place Order &mdash; {formatNaira(total)}</>
            )}
          </button>

          {submitError && <p className="co-summary__error">{submitError}</p>}

          <p className="co-summary__note">
            By placing this order, you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--crimson)", fontWeight: 600 }}>
              terms &amp; conditions
            </Link>
            .
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
