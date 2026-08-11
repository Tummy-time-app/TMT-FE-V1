"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bike, Navigation, Power } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetAvailableDeliveriesQuery,
  useGetRiderOrdersQuery,
  useClaimDeliveryMutation,
  useUpdateRiderLocationMutation,
} from "@/features/orders/ordersApi";
import { useRiderOnline, setRiderOnline } from "@/hooks/useRiderAvailability";
import { useGeolocationWatch, type GeolocationWatchStatus } from "@/hooks/useGeolocationWatch";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const GPS_STATUS_LABEL: Record<GeolocationWatchStatus, string> = {
  idle: "GPS off",
  watching: "GPS live",
  denied: "Location permission denied",
  unsupported: "GPS unsupported on this device",
  error: "GPS error",
};

export default function RiderDashboardPage() {
  const { user } = useAuth();
  const riderId = user?.id ?? "";
  const online = useRiderOnline();
  const toast = useToast();

  const { data: myOrders } = useGetRiderOrdersQuery(riderId, { skip: !riderId });
  const activeDelivery = myOrders?.find((o) => o.status === "in_transit");

  const { position, status: gpsStatus } = useGeolocationWatch(online);
  const [updateRiderLocation] = useUpdateRiderLocationMutation();

  useEffect(() => {
    if (position && activeDelivery && riderId) {
      updateRiderLocation({ orderId: activeDelivery.id, riderId, location: position });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.lat, position?.lng, activeDelivery?.id, riderId]);

  const {
    data: available,
    isLoading,
    error,
    refetch,
  } = useGetAvailableDeliveriesQuery(undefined, {
    skip: !online || !!activeDelivery,
    pollingInterval: online && !activeDelivery ? 5000 : 0,
  });

  const [claimDelivery, { isLoading: isClaiming }] = useClaimDeliveryMutation();

  const handleClaim = async (orderId: string) => {
    if (!user) return;
    try {
      await claimDelivery({
        orderId,
        rider: {
          riderId: user.id,
          riderName: user.name,
          riderPhone: user.phone ?? "",
          riderVehicleType: user.vehicleType ?? "bike",
        },
      }).unwrap();
      toast.success("Delivery claimed — head to the vendor.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Dashboard</h1>
          <p className="mt-1 text-small text-text-muted">
            {online ? "You're online and visible for new deliveries." : "Go online to start receiving delivery requests."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRiderOnline(!online)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-small font-semibold transition-colors",
            online ? "bg-error-bg text-error hover:bg-error/15" : "bg-primary text-white hover:bg-primary-dark"
          )}
        >
          <Power size={16} aria-hidden />
          {online ? "Go offline" : "Go online"}
        </button>
      </div>

      {online && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-text-muted">
          <span className={cn("h-2 w-2 rounded-full", gpsStatus === "watching" ? "bg-success" : "bg-warning")} />
          {GPS_STATUS_LABEL[gpsStatus]}
        </p>
      )}

      {activeDelivery ? (
        <section className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <p className="text-caption font-semibold uppercase tracking-wide text-primary">Current delivery</p>
          <p className="mt-1 font-display text-h3 font-bold text-text">{activeDelivery.vendorName}</p>
          <p className="mt-1 text-small text-text-muted">To: {activeDelivery.deliveryAddress}</p>
          <Link
            href={`/rider/orders/${activeDelivery.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Navigation size={15} aria-hidden />
            View delivery
          </Link>
        </section>
      ) : !online ? (
        <div className="mt-6">
          <EmptyState icon={Power} title="You're offline" description="Go online to see incoming delivery requests." />
        </div>
      ) : (
        <section className="mt-6">
          <h2 className="font-display text-h3 font-bold text-text">Incoming deliveries</h2>
          <div className="mt-3 space-y-2">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
            ) : error ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : !available || available.length === 0 ? (
              <EmptyState
                icon={Bike}
                title="No deliveries right now"
                description="New requests will appear here as soon as they're ready."
              />
            ) : (
              available.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-small font-semibold text-text">{order.vendorName}</p>
                    <p className="text-caption text-text-subtle">
                      To {order.deliveryAddress} · {formatNaira(order.deliveryFee)} fee
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaim(order.id)}
                    disabled={isClaiming}
                    className="shrink-0 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
