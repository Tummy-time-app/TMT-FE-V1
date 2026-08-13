"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "@/components/icons";
import { useGetAllOrdersQuery } from "@/features/orders/ordersApi";
import { useGetAllVendorsAdminQuery } from "@/features/vendors/vendorsApi";
import { useGetAllUsersQuery } from "@/features/auth/authApi";
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
  { days: 90, label: "90 days" },
] as const;

/** Buckets orders into calendar days (daily for ≤30 days) or ISO weeks (for 90, so the chart stays readable). */
function bucketOrders(orders: Order[], days: number) {
  const now = new Date();
  const weekly = days > 30;
  const bucketCount = weekly ? Math.ceil(days / 7) : days;

  const buckets: { key: string; label: string; orders: number; revenue: number }[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * (weekly ? 7 : 1));
    buckets.push({
      key: weekly ? `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}-${d.getMonth()}` : d.toDateString(),
      label: weekly ? `${d.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}` : DAY_LABELS[d.getDay()],
      orders: 0,
      revenue: 0,
    });
  }

  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);

  for (const order of orders) {
    const createdAt = new Date(order.createdAt);
    if (createdAt < cutoff) continue;
    const key = weekly
      ? `${createdAt.getFullYear()}-W${Math.ceil(createdAt.getDate() / 7)}-${createdAt.getMonth()}`
      : createdAt.toDateString();
    const bucket = buckets.find((b) => b.key === key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (COMPLETED_STATUSES.includes(order.status)) bucket.revenue += order.total;
  }

  return buckets;
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const { data: orders, isLoading: ordersLoading, error, refetch } = useGetAllOrdersQuery();
  const { data: vendors } = useGetAllVendorsAdminQuery();
  const { data: users } = useGetAllUsersQuery();

  const buckets = useMemo(() => (orders ? bucketOrders(orders, period) : []), [orders, period]);

  const topVendors = useMemo(() => {
    if (!orders || !vendors) return [];
    const revenueByVendor = new Map<string, number>();
    for (const o of orders) {
      if (!COMPLETED_STATUSES.includes(o.status)) continue;
      revenueByVendor.set(o.vendorId, (revenueByVendor.get(o.vendorId) ?? 0) + o.total);
    }
    return [...revenueByVendor.entries()]
      .map(([vendorId, revenue]) => ({ vendor: vendors.find((v) => v.id === vendorId), revenue }))
      .filter((r) => r.vendor)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, vendors]);

  const riderPerformance = useMemo(() => {
    if (!orders || !users) return [];
    const riders = users.filter((u) => u.role === "rider");
    const deliveredOrders = orders.filter((o) => o.status === "delivered" && o.rider);
    return riders
      .map((rider) => {
        const deliveries = deliveredOrders.filter((o) => o.rider?.id === rider.id);
        return {
          rider,
          deliveries: deliveries.length,
          earnings: deliveries.reduce((sum, o) => sum + o.deliveryFee, 0),
        };
      })
      .filter((r) => r.deliveries > 0)
      .sort((a, b) => b.deliveries - a.deliveries);
  }, [orders, users]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Analytics</h1>
          <p className="mt-1 text-small text-text-muted">Sales trends, top vendors, and rider performance.</p>
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
            {ordersLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={buckets.map((b) => ({ label: b.label, value: b.orders }))} />
            )}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Revenue</h2>
          <div className="mt-4">
            {ordersLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={buckets.map((b) => ({ label: b.label, value: b.revenue }))} valueFormatter={formatNaira} />
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Top vendors</h2>
          <div className="mt-3 space-y-1">
            {topVendors.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No revenue yet" description="Completed orders will populate this." />
            ) : (
              topVendors.map(({ vendor, revenue }, i) => (
                <div key={vendor!.id} className="flex items-center justify-between py-2 text-small">
                  <span className="flex items-center gap-2 text-text">
                    <span className="text-text-subtle">{i + 1}.</span>
                    {vendor!.name}
                  </span>
                  <span className="font-semibold text-text">{formatNaira(revenue)}</span>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Rider performance</h2>
          <div className="mt-3 space-y-1">
            {riderPerformance.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No deliveries yet" description="Completed deliveries will populate this." />
            ) : (
              riderPerformance.map(({ rider, deliveries, earnings }) => (
                <div key={rider.id} className="flex items-center justify-between py-2 text-small">
                  <span className="text-text">{rider.name}</span>
                  <span className="text-text-muted">
                    {deliveries} deliveries · <span className="font-semibold text-text">{formatNaira(earnings)}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
