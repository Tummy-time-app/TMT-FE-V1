"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Navigation } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { useGetOrderQuery, useMarkDeliveredMutation } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { Map } from "@/components/maps/Map";
import { VendorMarker } from "@/components/maps/VendorMarker";
import { UserLocation } from "@/components/maps/UserLocation";
import { RiderMarker } from "@/components/maps/RiderMarker";
import { DeliveryRoute } from "@/components/maps/DeliveryRoute";
import { ErrorState } from "@/components/feedback/ErrorState";
import { normalizeApiError } from "@/lib/utils/apiError";
import { useToast } from "@/components/feedback/ToastProvider";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function navigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export default function RiderDeliveryDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(params.id);
  const [markDelivered, { isLoading: isSubmitting }] = useMarkDeliveredMutation();
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofNote, setProofNote] = useState("");
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-6 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-black/5" />
      </div>
    );
  }

  if (error) {
    if (normalizeApiError(error).status === 404) notFound();
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!order) return null;

  const isMine = order.rider?.id === user?.id;

  const handleMarkDelivered = async () => {
    if (!user) return;
    try {
      await markDelivered({ orderId: order.id, riderId: user.id, proofNote: proofNote.trim() || "Delivered." }).unwrap();
      toast.success("Delivery marked as complete.");
      setShowProofForm(false);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/rider/orders"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden /> Deliveries
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption text-text-subtle">Order #{order.id}</p>
          <h1 className="font-display text-h2 font-bold text-text">{order.vendorName}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.rider && !isMine && (
        <p className="mt-2 text-caption font-semibold text-warning">This delivery is assigned to a different rider account.</p>
      )}

      <section className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
        <Map
          fitPoints={order.deliveryLocation ? [order.vendorLocation, order.deliveryLocation] : [order.vendorLocation]}
          height={220}
        >
          <VendorMarker position={order.vendorLocation} label={order.vendorName} />
          {order.deliveryLocation && <UserLocation position={order.deliveryLocation} />}
          {order.rider?.location && order.deliveryLocation && (
            <DeliveryRoute path={[order.vendorLocation, order.deliveryLocation]} />
          )}
          {order.rider?.location && <RiderMarker position={order.rider.location} />}
        </Map>
        {order.deliveryLocation && (
          <a
            href={navigationUrl(order.deliveryLocation.lat, order.deliveryLocation.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-t border-border p-3 text-small font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <Navigation size={15} aria-hidden />
            Navigate to customer
          </a>
        )}
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">Pickup</h2>
          <p className="mt-2 text-small text-text-muted">{order.vendorName}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">Drop-off</h2>
          <p className="mt-2 text-small text-text-muted">{order.deliveryAddress}</p>
          <p className="mt-1 text-caption text-text-subtle">{order.customerName}</p>
          {order.riderNote && <p className="mt-2 text-caption text-text-subtle">Note: {order.riderNote}</p>}
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-small font-bold text-text">Items ({order.items.length})</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2.5 text-small">
              <span className="text-text">
                {item.name} x{item.qty}
              </span>
              <span className="text-text-muted">{formatNaira(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-small font-semibold text-text">
          <span>Delivery fee (your earnings)</span>
          <span>{formatNaira(order.deliveryFee)}</span>
        </div>
      </section>

      {order.status === "in_transit" && (
        <section className="mt-6 rounded-lg border border-border bg-surface p-5">
          {!showProofForm ? (
            <button
              type="button"
              onClick={() => setShowProofForm(true)}
              className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Mark as delivered
            </button>
          ) : (
            <div>
              <label htmlFor="proofNote" className="mb-1.5 block text-small font-semibold text-text">
                Proof of delivery
              </label>
              <textarea
                id="proofNote"
                rows={2}
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. Handed to customer at the gate"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Confirming…" : "Confirm delivery"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProofForm(false)}
                  className="rounded-md px-5 py-2.5 text-small font-semibold text-text-muted transition-colors hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {order.status === "delivered" && order.proofNote && (
        <section className="mt-6 rounded-lg border border-success/30 bg-success-bg p-5 text-small font-semibold text-success">
          Delivered — {order.proofNote}
        </section>
      )}
    </div>
  );
}
