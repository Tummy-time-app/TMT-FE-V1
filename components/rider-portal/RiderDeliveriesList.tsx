"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderProfileQuery } from "@/features/rider/riderProfileApi";
import { useGetAvailableDeliveriesQuery, useAcceptDeliveryMutation } from "@/features/rider/riderOrdersApi";
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Rendered inside RiderPortalShell — a verified, signed-in rider is guaranteed. */
export function RiderDeliveriesList() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useGetRiderProfileQuery(user?.id ?? "", { skip: !user });
  const { data: deliveries = [], isLoading, isError } = useGetAvailableDeliveriesQuery(undefined, { skip: !profile?.isOnline });
  const { data: restaurants = [] } = useListRestaurantsQuery();
  const [acceptDelivery, { isLoading: isAccepting }] = useAcceptDeliveryMutation();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const restaurantNames = useMemo(() => {
    const map = new Map<string, string>();
    restaurants.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [restaurants]);

  const visible = deliveries.filter((d) => !dismissed.has(d.id));

  const handleAccept = async (id: string) => {
    if (!user || !profile) return;
    setError(null);
    setAcceptingId(id);
    try {
      await acceptDelivery({
        id,
        riderId: user.id,
        name: user.name,
        phone: user.phone,
        vehicle: profile.vehicleType,
        plateNumber: profile.plateNumber ?? undefined,
      }).unwrap();
      router.push(`/rider/deliveries/${id}`);
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDecline = (id: string) => {
    // Frontend-only — nothing was claimed, so there's no backend call to make.
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Deliveries</h1>
        <p className="vd-subtitle">Available delivery requests near you.</p>
      </header>

      {!profile?.isOnline ? (
        <p className="vp-empty">Go online from your dashboard to see delivery requests.</p>
      ) : isLoading ? (
        <p className="vp-empty">Loading…</p>
      ) : isError ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load deliveries</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="vp-empty">No delivery requests right now — check back soon.</p>
      ) : (
        <>
          {error && <p className="op-error">{error}</p>}
          {visible.map((delivery) => (
            <div className="rd-delivery-card" key={delivery.id}>
              <div className="rd-delivery-card__row">
                <div>
                  <p className="rd-delivery-card__label">Pickup</p>
                  <p className="rd-delivery-card__value">{restaurantNames.get(delivery.restaurantId) ?? "Restaurant"}</p>
                </div>
                <p className="rd-delivery-card__total">{formatNaira(Number(delivery.totalAmount))}</p>
              </div>
              <div className="rd-delivery-card__row" style={{ marginTop: 8 }}>
                <div>
                  <p className="rd-delivery-card__label">Drop-off</p>
                  <p className="rd-delivery-card__value">{delivery.deliveryAddress ?? "Address on file"}</p>
                </div>
              </div>
              <div className="rd-delivery-card__actions">
                <button className="rd-btn rd-btn--ghost" onClick={() => handleDecline(delivery.id)}>
                  Decline
                </button>
                <button className="rd-btn rd-btn--primary" onClick={() => handleAccept(delivery.id)} disabled={isAccepting}>
                  {acceptingId === delivery.id ? "Accepting…" : "Accept"}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
