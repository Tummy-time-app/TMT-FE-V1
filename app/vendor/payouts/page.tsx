"use client";

import { Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorOrdersQuery } from "@/features/orders/ordersApi";
import { useGetWithdrawalsQuery } from "@/features/payouts/payoutsApi";
import { StatCard } from "@/components/data-display/StatCard";
import { WithdrawSection } from "@/components/finance/WithdrawSection";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function VendorPayoutsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const actorId = user?.id ?? "";

  const { data: orders } = useGetVendorOrdersQuery(vendorId, { skip: !vendorId });
  const { data: withdrawals } = useGetWithdrawalsQuery(actorId, { skip: !actorId });

  const revenue = orders?.filter((o) => o.status === "delivered" || o.status === "picked_up").reduce((s, o) => s + o.total, 0) ?? 0;
  const withdrawn = withdrawals?.reduce((s, w) => s + w.amount, 0) ?? 0;
  const available = revenue - withdrawn;

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Payouts</h1>
      <p className="mt-1 text-small text-text-muted">Revenue from completed orders, minus what you&apos;ve withdrawn.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatNaira(available)} icon={Wallet} accent="success" />
        <StatCard label="Total revenue" value={formatNaira(revenue)} icon={TrendingUp} />
        <StatCard label="Withdrawn" value={formatNaira(withdrawn)} icon={ArrowUpRight} />
      </div>

      <div className="mt-8">
        <WithdrawSection actorId={actorId} availableBalance={available} />
      </div>
    </div>
  );
}
