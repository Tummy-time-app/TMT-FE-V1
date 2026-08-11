"use client";

import { Wallet, ClipboardList, Store, Bike, CheckCircle2, XCircle } from "@/components/icons";
import { useGetAllOrdersQuery } from "@/features/orders/ordersApi";
import { useGetAllVendorsAdminQuery } from "@/features/vendors/vendorsApi";
import { useGetAllUsersQuery } from "@/features/auth/authApi";
import { StatCard } from "@/components/data-display/StatCard";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { Order } from "@/features/orders/types";

const COMPLETED_STATUSES = ["delivered", "picked_up"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Buckets orders into the last 7 calendar days (oldest first). */
function lastSevenDays(orders: Order[]) {
  const days: { key: string; label: string; orders: number; revenue: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ key: d.toDateString(), label: DAY_LABELS[d.getDay()], orders: 0, revenue: 0 });
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toDateString();
    const bucket = days.find((d) => d.key === key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (COMPLETED_STATUSES.includes(order.status)) bucket.revenue += order.total;
  }

  return days;
}

export default function AdminDashboardPage() {
  const { data: orders, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useGetAllOrdersQuery();
  const { data: vendors, isLoading: vendorsLoading } = useGetAllVendorsAdminQuery();
  const { data: users, isLoading: usersLoading } = useGetAllUsersQuery();

  const isLoading = ordersLoading || vendorsLoading || usersLoading;

  if (ordersError) {
    return <ErrorState error={ordersError} onRetry={refetchOrders} />;
  }

  const totalOrders = orders?.length ?? 0;
  const completedOrders = orders?.filter((o) => COMPLETED_STATUSES.includes(o.status)) ?? [];
  const cancelledOrders = orders?.filter((o) => o.status === "cancelled") ?? [];
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
  const completionRate = totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders.length / totalOrders) * 100) : 0;

  const activeVendors = vendors?.filter((v) => v.approvalStatus === "approved").length ?? 0;
  const activeRiders = users?.filter((u) => u.role === "rider" && u.active).length ?? 0;

  const dailyData = orders ? lastSevenDays(orders) : [];

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Admin Dashboard</h1>
      <p className="mt-1 text-small text-text-muted">Platform-wide overview.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={isLoading ? "…" : formatNaira(totalRevenue)} icon={Wallet} accent="success" />
        <StatCard label="Total orders" value={isLoading ? "…" : String(totalOrders)} icon={ClipboardList} />
        <StatCard label="Active vendors" value={isLoading ? "…" : String(activeVendors)} icon={Store} />
        <StatCard label="Active riders" value={isLoading ? "…" : String(activeRiders)} icon={Bike} />
        <StatCard
          label="Completion rate"
          value={isLoading ? "…" : `${completionRate}%`}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Cancellation rate"
          value={isLoading ? "…" : `${cancellationRate}%`}
          icon={XCircle}
          accent={cancellationRate > 10 ? "warning" : "primary"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Orders — last 7 days</h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={dailyData.map((d) => ({ label: d.label, value: d.orders }))} />
            )}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-h3 font-bold text-text">Revenue — last 7 days</h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <SimpleBarChart data={dailyData.map((d) => ({ label: d.label, value: d.revenue }))} valueFormatter={formatNaira} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
