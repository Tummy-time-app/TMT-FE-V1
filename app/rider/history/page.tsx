"use client";

import Link from "next/link";
import { History } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function RiderHistoryPage() {
  const { user } = useAuth();
  const riderId = user?.id ?? "";
  const { data: orders, isLoading, error, refetch } = useGetRiderOrdersQuery(riderId, { skip: !riderId });

  const past = orders?.filter((o) => o.status === "delivered" || o.status === "cancelled") ?? [];

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">History</h1>
      <p className="mt-1 text-small text-text-muted">Every delivery you&apos;ve handled.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : past.length === 0 ? (
          <EmptyState icon={History} title="No history yet" description="Your completed deliveries will appear here." />
        ) : (
          past.map((order) => (
            <Link
              key={order.id}
              href={`/rider/orders/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text">{order.vendorName}</p>
                <p className="text-caption text-text-subtle">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-small font-semibold text-text">{formatNaira(order.deliveryFee)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
