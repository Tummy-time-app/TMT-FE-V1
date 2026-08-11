"use client";

import { useState } from "react";
import { ClipboardList } from "@/components/icons";
import { useGetAllOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/features/orders/types";

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "picked_up", label: "Picked up" },
  { key: "cancelled", label: "Cancelled" },
];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error, refetch } = useGetAllOrdersQuery();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = orders?.filter((o) => statusFilter === "all" || o.status === statusFilter) ?? [];

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Orders</h1>
      <p className="mt-1 text-small text-text-muted">Every order placed on the platform.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-caption font-semibold transition-colors",
              statusFilter === f.key
                ? "border-primary bg-primary text-white"
                : "border-border text-text-muted hover:border-primary/40 hover:text-primary"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders here" description="Nothing matches this filter yet." />
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">
                  {order.customerName} → {order.vendorName}
                </p>
                <p className="text-caption text-text-subtle">
                  #{order.id} · {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="shrink-0 text-small font-semibold text-text">{formatNaira(order.total)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
