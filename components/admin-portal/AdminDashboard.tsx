"use client";

import { useListUsersQuery } from "@/features/admin/adminUsersApi";
import { useListVendorsQuery } from "@/features/admin/adminVendorsApi";
import { useListRidersQuery } from "@/features/admin/adminRidersApi";
import { useListAllOrdersQuery } from "@/features/admin/adminOrdersApi";
import { useGetAdminRewardsSummaryQuery } from "@/features/admin/adminRewardsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Rendered inside AdminPortalShell, which already guarantees a signed-in admin before mounting this. */
export function AdminDashboard() {
  const { data: users } = useListUsersQuery({ page: 1, limit: 1 });
  const { data: vendors } = useListVendorsQuery({ page: 1, limit: 1 });
  const { data: riders } = useListRidersQuery({ page: 1, limit: 100 });
  const { data: orders } = useListAllOrdersQuery({ page: 1, limit: 1 });
  const { data: rewards, isLoading: isLoadingRewards, isError: isRewardsError } = useGetAdminRewardsSummaryQuery();

  const pendingRiders = riders?.data.filter((r) => r.verificationStatus === "pending").length ?? 0;

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Dashboard</h1>
        <p className="vd-subtitle">Platform overview.</p>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">At a glance</h2>
        <div className="vd-metrics-grid">
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{users?.pagination.total ?? "…"}</p>
            <p className="vd-metric-card__label">Total users</p>
          </div>
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{vendors?.pagination.total ?? "…"}</p>
            <p className="vd-metric-card__label">Total vendors</p>
          </div>
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{pendingRiders}</p>
            <p className="vd-metric-card__label">Riders pending verification</p>
          </div>
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{orders?.pagination.total ?? "…"}</p>
            <p className="vd-metric-card__label">Total orders</p>
          </div>
        </div>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Rewards program cost</h2>
        {isLoadingRewards ? (
          <p className="vp-empty">Loading…</p>
        ) : isRewardsError || !rewards ? (
          <div className="vp-empty">
            <p className="vp-empty-title">Couldn&apos;t load rewards totals</p>
          </div>
        ) : (
          <div className="vd-metrics-grid">
            <div className="vd-metric-card">
              <p className="vd-metric-card__value">{formatNaira(rewards.totalCashbackIssued)}</p>
              <p className="vd-metric-card__label">Cashback issued</p>
            </div>
            <div className="vd-metric-card">
              <p className="vd-metric-card__value">{rewards.loyaltyPointsOutstanding.toLocaleString("en-NG")}</p>
              <p className="vd-metric-card__label">Loyalty points outstanding</p>
            </div>
            <div className="vd-metric-card">
              <p className="vd-metric-card__value">{formatNaira(rewards.totalRiderEarningsPaid)}</p>
              <p className="vd-metric-card__label">Rider earnings paid</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
