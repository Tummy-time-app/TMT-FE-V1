"use client";

import { useGetAdminRewardsSummaryQuery } from "@/features/admin/adminRewardsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Rendered inside AdminPortalShell. Read-only platform-wide rewards totals — blueprint §28. */
export function AdminRewardsView() {
  const { data, isLoading, isError } = useGetAdminRewardsSummaryQuery();

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Rewards</h1>
        <p className="vd-subtitle">Financial impact of the loyalty program, platform-wide.</p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading…</p>
      ) : isError || !data ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load rewards totals</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : (
        <>
          <div className="vd-section">
            <h2 className="vd-section-title">Cashback</h2>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(data.totalCashbackIssued)}</p>
                <p className="vd-metric-card__label">Total issued</p>
              </div>
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Loyalty points</h2>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{data.loyaltyPointsOutstanding.toLocaleString("en-NG")}</p>
                <p className="vd-metric-card__label">Outstanding</p>
              </div>
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Free delivery</h2>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{data.freeDeliveriesEarned}</p>
                <p className="vd-metric-card__label">Earned</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{data.freeDeliveriesUsed}</p>
                <p className="vd-metric-card__label">Used</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{data.freeDeliveriesExpired}</p>
                <p className="vd-metric-card__label">Expired</p>
              </div>
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Wallet &amp; rider payouts</h2>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(data.totalWalletDeposits)}</p>
                <p className="vd-metric-card__label">Total deposits</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(data.totalWalletBalance)}</p>
                <p className="vd-metric-card__label">Held in wallets</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(data.totalRiderEarningsPaid)}</p>
                <p className="vd-metric-card__label">Rider earnings paid</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
