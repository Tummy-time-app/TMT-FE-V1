"use client";

import { useAuth } from "@/features/auth/hooks";
import { useGetRiderEarningsSummaryQuery, useGetRiderEarningsHistoryQuery } from "@/features/rider/riderEarningsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Rendered inside RiderPortalShell — a verified, signed-in rider is guaranteed. */
export function RiderEarnings() {
  const { user } = useAuth();
  const { data: summary, isLoading: isLoadingSummary, isError: isSummaryError } = useGetRiderEarningsSummaryQuery(user?.id ?? "", { skip: !user });
  const { data: history = [], isLoading: isLoadingHistory } = useGetRiderEarningsHistoryQuery(user?.id ?? "", { skip: !user });

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Earnings</h1>
        <p className="vd-subtitle">Track what you&apos;ve earned from completed deliveries.</p>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Summary</h2>
        {isLoadingSummary ? (
          <p className="vp-empty">Loading…</p>
        ) : isSummaryError || !summary ? (
          <div className="vp-empty">
            <p className="vp-empty-title">Couldn&apos;t load earnings</p>
            <p className="vp-empty-sub">Please check your connection and try again.</p>
          </div>
        ) : (
          <>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(summary.totalEarnings)}</p>
                <p className="vd-metric-card__label">Total earnings</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{summary.completedDeliveries}</p>
                <p className="vd-metric-card__label">Completed deliveries</p>
              </div>
            </div>
            <p className="vd-subtitle" style={{ marginTop: 10 }}>
              Each delivery pays a flat placeholder rate — TummyTime doesn&apos;t compute real per-delivery fees from distance/time yet.
            </p>
          </>
        )}
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">History</h2>
        {isLoadingHistory ? (
          <p className="vp-empty">Loading…</p>
        ) : history.length === 0 ? (
          <p className="vp-empty">No completed deliveries yet.</p>
        ) : (
          <div className="vd-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>#{entry.orderId.slice(0, 8)}</td>
                    <td>{formatNaira(Number(entry.amount))}</td>
                    <td>{formatDate(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
