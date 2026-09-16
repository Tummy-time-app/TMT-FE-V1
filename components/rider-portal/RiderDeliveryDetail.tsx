"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetOrderQuery } from "@/features/orders/ordersApi";
import { useGetRestaurantQuery } from "@/features/restaurants/restaurantsApi";
import { useMarkRiderArrivedMutation, useConfirmPickupMutation, useCompleteDeliveryMutation } from "@/features/rider/riderOrdersApi";
import { RIDER_BASE_DELIVERY_FEE } from "@/features/rider/constants";
import { normalizeApiError } from "@/lib/utils/apiError";
import { Map, type LatLng, type MapMarker } from "@/components/maps/Map";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function RiderDeliveryDetail({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const { data: order, isLoading, isError, refetch } = useGetOrderQuery(orderId);
  const { data: restaurant } = useGetRestaurantQuery(order?.restaurantId ?? "", { skip: !order });
  const [markArrived, { isLoading: isMarkingArrived }] = useMarkRiderArrivedMutation();
  const [confirmPickup, { isLoading: isConfirmingPickup }] = useConfirmPickupMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();

  const [pin, setPin] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [riderPos, setRiderPos] = useState<LatLng | null>(null);

  // One-time snapshot for the map — no continuous tracking, see the
  // rider-app implementation plan's "no live GPS" decision.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setRiderPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // permission denied / unavailable — map just shows vendor/customer instead
      }
    );
  }, []);

  if (isLoading) {
    return <p className="vp-empty">Loading…</p>;
  }

  if (isError || !order) {
    return (
      <div className="vp-empty">
        <p className="vp-empty-title">Delivery not found</p>
        <Link href="/rider/deliveries" className="vp-empty-cta">
          Back to deliveries
        </Link>
      </div>
    );
  }

  if (!order.riderInfo || (user && order.riderInfo.riderId !== user.id)) {
    return (
      <div className="vp-empty">
        <p className="vp-empty-title">This delivery isn&apos;t assigned to you</p>
        <Link href="/rider/deliveries" className="vp-empty-cta">
          Back to deliveries
        </Link>
      </div>
    );
  }

  const vendorPos = restaurant?.lat != null && restaurant?.lng != null ? { lat: restaurant.lat, lng: restaurant.lng } : null;
  const customerPos = order.deliveryLat != null && order.deliveryLng != null ? { lat: order.deliveryLat, lng: order.deliveryLng } : null;
  const isPickupPhase = order.status === "ready_for_pickup" || order.status === "rider_arrived";
  const mapCenter = isPickupPhase ? vendorPos ?? riderPos : customerPos ?? vendorPos;
  const markers: MapMarker[] = [
    ...(vendorPos ? [{ id: "vendor", kind: "vendor" as const, ...vendorPos }] : []),
    ...(customerPos && !isPickupPhase ? [{ id: "customer", kind: "customer" as const, ...customerPos }] : []),
    ...(riderPos ? [{ id: "rider", kind: "rider" as const, ...riderPos }] : []),
  ];

  const handleArrived = async () => {
    setActionError(null);
    try {
      await markArrived({ id: order.id }).unwrap();
    } catch (err) {
      setActionError(normalizeApiError(err as never).message);
    }
  };

  const handlePickup = async () => {
    setActionError(null);
    try {
      await confirmPickup({ id: order.id }).unwrap();
    } catch (err) {
      setActionError(normalizeApiError(err as never).message);
    }
  };

  const handleDeliver = async () => {
    setActionError(null);
    try {
      await completeDelivery({ id: order.id, pin }).unwrap();
    } catch (err) {
      setActionError(normalizeApiError(err as never).message);
    }
  };

  if (order.status === "delivered") {
    return (
      <div className="vp-empty">
        <div className="vp-empty-icon">🎉</div>
        <p className="vp-empty-title">Delivery completed</p>
        <p className="vp-empty-sub">You earned {formatNaira(RIDER_BASE_DELIVERY_FEE)} for this delivery.</p>
        <Link href="/rider/deliveries" className="vp-empty-cta">
          Back to deliveries
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/rider/deliveries" className="op-back-link">
        ← Back to deliveries
      </Link>

      <header className="vd-header">
        <h1 className="vd-title">Order #{order.id.slice(0, 8)}</h1>
        <p className="vd-subtitle">{isPickupPhase ? "Head to the restaurant to pick up this order." : "Deliver this order to the customer."}</p>
      </header>

      {mapCenter && (
        <div style={{ marginBottom: 20 }}>
          <Map center={mapCenter} zoom={13} height={220} markers={markers} route={vendorPos && customerPos ? [vendorPos, customerPos] : undefined} />
        </div>
      )}

      {actionError && <p className="op-error">{actionError}</p>}

      {isPickupPhase ? (
        <div className="rd-delivery-card">
          <p className="rd-delivery-card__label">Pickup from</p>
          <p className="rd-delivery-card__value">{restaurant?.name ?? "Restaurant"}</p>
          <p className="vd-subtitle" style={{ marginTop: 4 }}>{restaurant?.address}</p>
          {restaurant?.phone && <p className="vd-subtitle">📞 {restaurant.phone}</p>}

          <div className="rd-delivery-card__actions">
            {order.status === "ready_for_pickup" ? (
              <button className="rd-btn rd-btn--primary" onClick={handleArrived} disabled={isMarkingArrived}>
                {isMarkingArrived ? "Updating…" : "I Have Arrived"}
              </button>
            ) : (
              <button className="rd-btn rd-btn--primary" onClick={handlePickup} disabled={isConfirmingPickup}>
                {isConfirmingPickup ? "Confirming…" : "Confirm Pickup"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rd-delivery-card">
          <p className="rd-delivery-card__label">Deliver to</p>
          <p className="rd-delivery-card__value">{order.deliveryAddress ?? "Address on file"}</p>

          <p className="vd-subtitle" style={{ marginTop: 14 }}>Ask the customer for their delivery PIN</p>
          <input
            className="rd-pin-input"
            inputMode="numeric"
            maxLength={4}
            placeholder="0000"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />

          <div className="rd-delivery-card__actions">
            <button className="rd-btn rd-btn--primary" onClick={handleDeliver} disabled={isCompleting || pin.length !== 4}>
              {isCompleting ? "Completing…" : "Complete Delivery"}
            </button>
          </div>
        </div>
      )}

      <button className="rd-btn rd-btn--ghost" style={{ marginTop: 16, width: "100%" }} onClick={() => refetch()}>
        Refresh status
      </button>
    </>
  );
}
