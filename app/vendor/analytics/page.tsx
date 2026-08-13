"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorOrdersQuery } from "@/features/orders/ordersApi";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/features/orders/types";

const COMPLETED_STATUSES = ["delivered", "picked_up"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
] as const;

/** Same daily-bucketing shape as /admin/analytics — kept local since it's only ~15 lines and scoped differently (one vendor's orders, not the platform's). */
function bucketOrders(orders: Order[], days: number) {
  const now = new Date();
  const buckets: { key: string; label: string; orders: number; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.push({ key: d.toDateString(), label: DAY_LABELS[d.getDay()], orders: 0, revenue: 0 });
  }

  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);

  for (const order of orders) {
    const createdAt = new Date(order.createdAt);
    if (createdAt < cutoff) continue;
    const bucket = buckets.find((b) => b.key === createdAt.toDateString());
    if (!bucket) continue;
    bucket.orders += 1;
    if (COMPLETED_STATUSES.includes(order.status)) bucket.revenue += order.total;
  }

  return buckets;
}

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const [period, setPeriod] = useState<7 | 30>(7);
  const { data: orders, isLoading, error, refetch } = useGetVendorOrdersQuery(vendorId, { skip: !vendorId });

  const buckets = useMemo(() => (orders ? bucketOrders(orders, period) : []), [orders, period]);

  const topProducts = useMemo(() => {
    if (!orders) return [];
    const revenueByName = new Map<string, { qty: number; revenue: number }>();
    for (const order of orders) {
      if (!COMPLETED_STATUSES.includes(order.status)) continue;
      for (const item of order.items) {
        const entry = revenueByName.get(item.name) ?? { qty: 0, revenue: 0 };
        entry.qty += item.qty;
        entry.revenue += item.price * item.qty;
        revenueByName.set(item.name, entry);
      }
    }
    return [...revenueByName.entries()]
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Analytics</h1>
          <p className="mt-1 text-small text-text-muted">How your store is doing over time.</p>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setPeriod(p.days)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-caption font-semibold transition-colors",
                period === p.days ? "bg-primary text-white" : "text-text-muted hover:text-text"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Orders</h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={buckets.map((b) => ({ label: b.label, value: b.orders }))} />
            )}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Revenue</h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={buckets.map((b) => ({ label: b.label, value: b.revenue }))} valueFormatter={formatNaira} />
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-h3 font-bold text-text">Top products</h2>
        <div className="mt-3 space-y-1">
          {topProducts.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No sales yet" description="Completed orders will populate this." />
          ) : (
            topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2 text-small">
                <span className="flex items-center gap-2 text-text">
                  <span className="text-text-subtle">{i + 1}.</span>
                  {p.name} <span className="text-caption text-text-subtle">× {p.qty}</span>
                </span>
                <span className="font-semibold text-text">{formatNaira(p.revenue)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
