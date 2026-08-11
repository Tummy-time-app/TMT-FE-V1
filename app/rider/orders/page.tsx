"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function RiderOrdersPage() {
  const { user } = useAuth();
  const riderId = user?.id ?? "";
  const [tab, setTab] = useState<TabKey>("active");

  const { data: orders, isLoading, error, refetch } = useGetRiderOrdersQuery(riderId, { skip: !riderId });

  const filtered = orders?.filter((o) => (tab === "active" ? o.status === "in_transit" : o.status === "delivered")) ?? [];

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Deliveries</h1>
      <p className="mt-1 text-small text-text-muted">Your claimed deliveries.</p>

      <div className="mt-5 flex gap-2">
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
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Bike} title="Nothing here" description="Claimed deliveries will show up in this tab." />
        ) : (
          filtered.map((order) => (
            <Link
              key={order.id}
              href={`/rider/orders/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text">{order.vendorName}</p>
                <p className="text-caption text-text-subtle">
                  #{order.id} · {formatDate(order.createdAt)}
                </p>
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
