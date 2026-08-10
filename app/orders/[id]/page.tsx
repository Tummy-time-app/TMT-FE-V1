"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bike, Car, Phone, Star } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useOrderRealtime } from "@/features/orders/useOrderRealtime";
import { useCancelOrderMutation } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConnectionStatusBadge } from "@/components/feedback/ConnectionStatusBadge";
import { Map } from "@/components/maps/Map";
import { VendorMarker } from "@/components/maps/VendorMarker";
import { UserLocation } from "@/components/maps/UserLocation";
import { RiderMarker } from "@/components/maps/RiderMarker";
import { DeliveryRoute } from "@/components/maps/DeliveryRoute";
import { normalizeApiError } from "@/lib/utils/apiError";
import { useToast } from "@/components/feedback/ToastProvider";
import type { PaymentMethod, PaymentStatus, VehicleType } from "@/features/orders/types";

const VEHICLE_LABEL: Record<VehicleType, string> = { bike: "Motorbike", bicycle: "Bicycle", car: "Car" };
const VEHICLE_ICON: Record<VehicleType, typeof Bike> = { bike: Bike, bicycle: Bike, car: Car };

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash_on_delivery: "Pay on delivery",
  bank_transfer: "Bank transfer",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing…",
  paid: "Paid",
  failed: "Failed",
};

const TERMINAL_STATUSES = ["delivered", "picked_up", "cancelled"];

function OrderDetailContent({ id }: { id: string }) {
  const { data: order, isLoading, error, refetch } = useOrderRealtime(id);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const handleCancel = async () => {
    try {
      await cancelOrder(id).unwrap();
      setConfirmOpen(false);
      toast.success("Order cancelled.");
    } catch (err) {
      setConfirmOpen(false);
      toast.error(normalizeApiError(err as never).message);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-48 animate-pulse rounded-lg bg-black/5" />
      </main>
    );
  }

  if (error) {
    if (normalizeApiError(error).status === 404) notFound();
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!order) return null;

  const isLive = !TERMINAL_STATUSES.includes(order.status);
  const canCancel = order.status === "pending" || order.status === "accepted";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption text-text-subtle">Order #{order.id}</p>
          <h1 className="font-display text-h2 font-bold text-text">{order.vendorName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isLive && <ConnectionStatusBadge />}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      {order.orderType === "delivery" && order.status !== "cancelled" && (
        <section className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
          <Map fitPoints={order.deliveryLocation ? [order.vendorLocation, order.deliveryLocation] : [order.vendorLocation]} height={220}>
            <VendorMarker position={order.vendorLocation} label={order.vendorName} />
            {order.deliveryLocation && <UserLocation position={order.deliveryLocation} />}
            {order.rider?.location && order.deliveryLocation && (
              <DeliveryRoute path={[order.vendorLocation, order.deliveryLocation]} />
            )}
            {order.rider?.location && <RiderMarker position={order.rider.location} />}
          </Map>

          {order.rider ? (
            <div className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {(() => {
                  const VehicleIcon = VEHICLE_ICON[order.rider.vehicleType];
                  return <VehicleIcon size={18} aria-hidden />;
                })()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text">{order.rider.name}</p>
                <p className="flex items-center gap-2 text-caption text-text-muted">
                  {VEHICLE_LABEL[order.rider.vehicleType]}
                  <span className="inline-flex items-center gap-0.5">
                    <Star size={11} className="fill-secondary text-secondary" aria-hidden />
                    {order.rider.rating.toFixed(1)}
                  </span>
                </p>
              </div>
              <a
                href={`tel:${order.rider.phone.replace(/\s/g, "")}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                aria-label={`Call ${order.rider.name}`}
              >
                <Phone size={15} aria-hidden />
              </a>
            </div>
          ) : (
            <p className="p-4 text-small text-text-muted">A rider will be assigned once the vendor accepts your order.</p>
          )}
        </section>
      )}

      <section className="mt-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-small font-bold text-text">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{item.name}</p>
                {item.note && <p className="text-caption text-text-muted">{item.note}</p>}
              </div>
              <span className="text-small text-text-muted">x{item.qty}</span>
              <span className="text-small font-semibold text-text">{formatNaira(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-small">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          {order.orderType === "delivery" && (
            <div className="flex justify-between text-text-muted">
              <span>Delivery fee</span>
              <span>{formatNaira(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-text">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">
            {order.orderType === "delivery" ? "Delivery address" : "Pickup location"}
          </h2>
          <p className="mt-2 text-small text-text-muted">
            {order.orderType === "delivery" ? order.deliveryAddress : order.vendorName}
          </p>
          {order.riderNote && <p className="mt-2 text-caption text-text-subtle">Note: {order.riderNote}</p>}
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">Payment</h2>
          <p className="mt-2 text-small text-text-muted">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
          <p className="mt-1 text-caption text-text-subtle">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</p>
        </div>
      </section>

      {canCancel && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border-2 border-error/30 px-5 py-2.5 text-small font-semibold text-error transition-colors duration-fast hover:bg-error-bg"
          >
            Cancel order
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this order?"
        description="This can't be undone. The vendor will be notified immediately."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        isConfirming={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <RequireAuth>
      <OrderDetailContent id={params.id} />
    </RequireAuth>
  );
}
