"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetOrderQuery, useUpdateOrderStatusMutation } from "@/features/orders/ordersApi";
import { useGetRestaurantQuery } from "@/features/restaurants/restaurantsApi";
import { CANCELABLE_STATUSES, ORDER_JOURNEY, ORDER_STATUS_META } from "@/features/orders/statusMeta";
import { normalizeApiError } from "@/lib/utils/apiError";
import { Map, type MapMarker } from "@/components/maps/Map";
import { RewardSummary } from "@/components/rewards/RewardSummary";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/orders/${orderId}`);
    }
  }, [isSessionLoading, isAuthenticated, router, orderId]);

  const { data: order, isLoading, isError } = useGetOrderQuery(orderId, { skip: !isAuthenticated });
  const { data: restaurant } = useGetRestaurantQuery(order?.restaurantId ?? "", { skip: !order });
  const [updateStatus, { isLoading: isCancelling }] = useUpdateOrderStatusMutation();
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isSessionLoading || !isAuthenticated || isLoading) {
    return (
      <div className="op-detail">
        <p className="vp-empty">Loading…</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="op-detail">
        <p className="vp-empty-title">Order not found</p>
        <Link href="/orders" className="vp-empty-cta">
          ← Back to your orders
        </Link>
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const isStopped = order.status === "rejected" || order.status === "cancelled";
  const currentStepIndex = ORDER_JOURNEY.indexOf(order.status === "rider_arrived" ? "picked_up" : order.status);
  const canCancel = CANCELABLE_STATUSES.includes(order.status);

  // Only real when both ends are known: the restaurant has a set location
  // (features/restaurants/types.ts — most vendor-created stores don't yet)
  // and this order was placed with a map-picked delivery address (older
  // orders and hand-typed addresses have neither). No live GPS exists
  // anywhere in this app (see components/maps/), so the rider pin below is
  // a deterministic position derived from `order.status`, not a real feed
  // — it moves vendor→delivery as the order progresses past "picked up",
  // same honesty rule as the rest of this app's decorative-vs-real pieces.
  const vendorPos = restaurant?.lat != null && restaurant?.lng != null ? { lat: restaurant.lat, lng: restaurant.lng } : null;
  const deliveryPos = order.deliveryLat != null && order.deliveryLng != null ? { lat: order.deliveryLat, lng: order.deliveryLng } : null;
  const showMap = !isStopped && vendorPos && deliveryPos;

  let riderPos: { lat: number; lng: number } | null = null;
  if (showMap) {
    const pickedUpIndex = ORDER_JOURNEY.indexOf("picked_up");
    const deliveredIndex = ORDER_JOURNEY.indexOf("delivered");
    if (currentStepIndex >= pickedUpIndex) {
      const frac = Math.min(1, Math.max(0, (currentStepIndex - pickedUpIndex) / (deliveredIndex - pickedUpIndex)));
      riderPos = {
        lat: vendorPos.lat + (deliveryPos.lat - vendorPos.lat) * frac,
        lng: vendorPos.lng + (deliveryPos.lng - vendorPos.lng) * frac,
      };
    }
  }

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await updateStatus({ id: order.id, status: "cancelled" }).unwrap();
    } catch (err) {
      setCancelError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="op-detail">
      <Link href="/orders" className="op-back-link">
        ← Back to your orders
      </Link>

      <div className="op-detail__header">
        <div>
          <p className="op-detail__vendor">{restaurant?.name ?? "Restaurant"}</p>
        </div>
        <span className={`op-badge op-badge--${meta.tone}`}>{meta.label}</span>
      </div>
      <p className="op-detail__id">
        Order #{order.id.slice(0, 8)} · {formatDateTime(order.createdAt)}
      </p>

      {isStopped ? (
        <div className="op-journey op-journey--stopped">
          <p className="op-journey__stopped-label">
            {order.status === "cancelled" ? "This order was cancelled." : "This order was rejected by the restaurant."}
          </p>
        </div>
      ) : (
        <div className="op-journey">
          {ORDER_JOURNEY.map((step, i) => {
            const done = i < currentStepIndex;
            const current = i === currentStepIndex;
            return (
              <div
                key={step}
                className={`op-journey__step ${done ? "op-journey__step--done" : ""} ${current ? "op-journey__step--current" : ""}`}
              >
                {i < ORDER_JOURNEY.length - 1 && <div className="op-journey__line" />}
                <span className="op-journey__dot">{done ? "✓" : ""}</span>
                <span className="op-journey__label">{ORDER_STATUS_META[step].label}</span>
              </div>
            );
          })}
        </div>
      )}

      {showMap && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <h2 className="op-section-title">Delivery route</h2>
          <Map
            center={vendorPos}
            zoom={13}
            height={200}
            route={[vendorPos, deliveryPos]}
            markers={[
              { id: "vendor", kind: "vendor", ...vendorPos },
              { id: "delivery", kind: "customer", ...deliveryPos },
              ...(riderPos ? ([{ id: "rider", kind: "rider", ...riderPos }] as MapMarker[]) : []),
            ]}
          />
          {order.status === "out_for_delivery" && (
            <p className="op-address" style={{ marginTop: 8 }}>
              🛵 Your rider is on the way.
            </p>
          )}
        </div>
      )}

      {order.riderInfo && !isStopped && (
        <div className="op-summary" style={{ marginBottom: 16 }}>
          <p className="op-detail__vendor">{order.riderInfo.name ?? "Your rider"}</p>
          {order.riderInfo.vehicle && <p className="op-address">{order.riderInfo.vehicle}{order.riderInfo.plateNumber ? ` · ${order.riderInfo.plateNumber}` : ""}</p>}
          {order.riderInfo.phone && <p className="op-address">📞 {order.riderInfo.phone}</p>}

          {["rider_arrived", "picked_up", "out_for_delivery"].includes(order.status) && order.deliveryPin && (
            <>
              <p className="op-address" style={{ marginTop: 10 }}>Give this code to your rider to confirm delivery:</p>
              <span className="rwd-summary-row__value" style={{ fontSize: "1.3rem", letterSpacing: "0.3em" }}>{order.deliveryPin}</span>
            </>
          )}
        </div>
      )}

      {order.status === "delivered" && user && (
        <div style={{ marginBottom: 20 }}>
          <RewardSummary userId={user.id} orderId={order.id} restaurantId={order.restaurantId} />
        </div>
      )}

      <h2 className="op-section-title">Items</h2>
      <div className="op-items">
        {order.items.map((item, i) => (
          <div key={`${item.menuItemId}-${i}`} className="op-item-row">
            <div>
              <p className="op-item-row__name">{item.name}</p>
              <p className="op-item-row__qty">Qty {item.quantity}</p>
            </div>
            <span className="op-item-row__price">{formatNaira(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="op-summary">
        <div className="op-summary__row op-summary__row--total">
          <span>Total</span>
          <span>{formatNaira(Number(order.totalAmount))}</span>
        </div>
        {order.deliveryAddress && (
          <p className="op-address" style={{ marginTop: 10 }}>
            📍 {order.deliveryAddress}
          </p>
        )}
      </div>

      {canCancel && (
        <>
          {cancelError && <p className="op-error">{cancelError}</p>}
          <button className="op-cancel-btn" onClick={handleCancel} disabled={isCancelling}>
            {isCancelling ? "Cancelling…" : "Cancel order"}
          </button>
        </>
      )}
    </div>
  );
}
