"use client";

import { Wallet, CalendarDays, TrendingUp } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderOrdersQuery } from "@/features/orders/ordersApi";
import { useGetWithdrawalsQuery } from "@/features/payouts/payoutsApi";
import { StatCard } from "@/components/data-display/StatCard";
import { WithdrawSection } from "@/components/finance/WithdrawSection";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function isThisWeek(iso: string) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return new Date(iso) >= weekAgo;
}

export default function RiderEarningsPage() {
  const { user } = useAuth();
  const riderId = user?.id ?? "";
  const { data: orders, isLoading, error, refetch } = useGetRiderOrdersQuery(riderId, { skip: !riderId });
  const { data: withdrawals } = useGetWithdrawalsQuery(riderId, { skip: !riderId });

  const completed = orders?.filter((o) => o.status === "delivered") ?? [];
  const todayTotal = completed.filter((o) => isToday(o.createdAt)).reduce((s, o) => s + o.deliveryFee, 0);
  const weekTotal = completed.filter((o) => isThisWeek(o.createdAt)).reduce((s, o) => s + o.deliveryFee, 0);
  const allTimeTotal = completed.reduce((s, o) => s + o.deliveryFee, 0);
  const withdrawn = withdrawals?.reduce((s, w) => s + w.amount, 0) ?? 0;
  const availableBalance = allTimeTotal - withdrawn;

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Earnings</h1>
      <p className="mt-1 text-small text-text-muted">Your delivery fee earnings from completed deliveries.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={formatNaira(todayTotal)} icon={CalendarDays} accent="success" />
        <StatCard label="This week" value={formatNaira(weekTotal)} icon={TrendingUp} />
        <StatCard label="Available to withdraw" value={formatNaira(availableBalance)} icon={Wallet} accent="success" />
      </div>

      <div className="mt-8">
        <WithdrawSection actorId={riderId} availableBalance={availableBalance} />
      </div>

      <h2 className="mt-8 font-display text-h3 font-bold text-text">Completed deliveries</h2>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : completed.length === 0 ? (
          <EmptyState icon={Wallet} title="No earnings yet" description="Completed deliveries will show up here." />
        ) : (
          completed.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text">{order.vendorName}</p>
                <p className="text-caption text-text-subtle">{formatDate(order.createdAt)}</p>
              </div>
              <span className="shrink-0 text-small font-semibold text-success">+{formatNaira(order.deliveryFee)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
