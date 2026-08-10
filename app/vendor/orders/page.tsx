"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/features/orders/types";

const ACTIVE_STATUSES: OrderStatus[] = ["accepted", "preparing", "ready_for_pickup", "in_transit"];
const COMPLETED_STATUSES: OrderStatus[] = ["delivered", "picked_up"];

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function matchesTab(status: OrderStatus, tab: TabKey): boolean {
  switch (tab) {
    case "all":
      return true;
    case "pending":
      return status === "pending";
    case "active":
      return ACTIVE_STATUSES.includes(status);
    case "completed":
      return COMPLETED_STATUSES.includes(status);
    case "cancelled":
      return status === "cancelled";
  }
}

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const [tab, setTab] = useState<TabKey>("all");

  const { data: orders, isLoading, error, refetch } = useGetVendorOrdersQuery(vendorId, { skip: !vendorId });

  const filtered = orders?.filter((o) => matchesTab(o.status, tab)) ?? [];

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Orders</h1>
      <p className="mt-1 text-small text-text-muted">Manage incoming and in-progress orders.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-small font-semibold transition-colors",
              tab === t.key
                ? "border-primary bg-primary text-white"
                : "border-border text-text-muted hover:border-primary/40 hover:text-primary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders here" description="Nothing matches this filter yet." />
        ) : (
          filtered.map((order) => (
            <Link
              key={order.id}
              href={`/vendor/orders/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text">{order.customerName}</p>
                <p className="text-caption text-text-subtle">
                  #{order.id} · {formatDate(order.createdAt)} · {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-small font-semibold text-text">{formatNaira(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
