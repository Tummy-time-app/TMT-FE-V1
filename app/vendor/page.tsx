"use client";

import Link from "next/link";
import { ClipboardList, ListChecks, Power, Star, Wallet } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorOrdersQuery } from "@/features/orders/ordersApi";
import { useGetVendorDetailQuery, useSetVendorTemporarilyClosedMutation } from "@/features/vendors/vendorsApi";
import { StatCard } from "@/components/data-display/StatCard";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/features/orders/types";

const ACTIVE_STATUSES: OrderStatus[] = ["accepted", "preparing", "ready_for_pickup", "in_transit"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const toast = useToast();

  const { data: orders, isLoading: ordersLoading, error, refetch } = useGetVendorOrdersQuery(vendorId, { skip: !vendorId });
  const { data: vendorDetail } = useGetVendorDetailQuery(vendorId, { skip: !vendorId });
  const [setTemporarilyClosed, { isLoading: isTogglingClosed }] = useSetVendorTemporarilyClosedMutation();

  const handleToggleClosed = async (closed: boolean) => {
    try {
      await setTemporarilyClosed({ vendorId, closed }).unwrap();
      toast.success(closed ? "Store marked closed for today." : "Store reopened.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  if (!vendorId) {
    return (
      <EmptyState
        title="No vendor linked to this account"
        description="This account isn't associated with a vendor profile yet."
      />
    );
  }

  const pendingCount = orders?.filter((o) => o.status === "pending").length ?? 0;
  const activeCount = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)).length ?? 0;
  const todayOrders = orders?.filter((o) => isToday(o.createdAt) && o.status !== "cancelled") ?? [];
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const restaurant = vendorDetail?.restaurant;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Dashboard</h1>
          <p className="mt-1 text-small text-text-muted">
            Here&apos;s how {restaurant?.name ?? "your store"} is doing today.
            {restaurant?.commissionRate != null && (
              <> Platform commission: <span className="font-semibold text-text">{Math.round(restaurant.commissionRate * 100)}%</span>.</>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleToggleClosed(!restaurant?.isTemporarilyClosed)}
          disabled={isTogglingClosed || !restaurant}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-small font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            restaurant?.isTemporarilyClosed
              ? "border-error/30 bg-error-bg text-error"
              : "border-success/30 bg-success-bg text-success"
          )}
        >
          <Power size={15} aria-hidden />
          {restaurant?.isTemporarilyClosed ? "Closed for today — Reopen" : "Open — Close for today"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending orders"
          value={String(pendingCount)}
          icon={ClipboardList}
          accent={pendingCount > 0 ? "warning" : "primary"}
        />
        <StatCard label="Active orders" value={String(activeCount)} icon={ListChecks} />
        <StatCard label="Today's revenue" value={formatNaira(todayRevenue)} icon={Wallet} accent="success" />
        <StatCard
          label="Rating"
          value={restaurant ? `${restaurant.rating.toFixed(1)} (${restaurant.reviews})` : "—"}
          icon={Star}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-h3 font-bold text-text">Recent orders</h2>
        <Link href="/vendor/orders" className="text-small font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {ordersLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !orders || orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders yet" description="New orders will show up here." />
        ) : (
          orders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              href={`/vendor/orders/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text">{order.customerName}</p>
                <p className="text-caption text-text-subtle">
                  #{order.id} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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
