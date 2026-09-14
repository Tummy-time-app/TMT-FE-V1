"use client";

import { useGetEarningsSummaryQuery, useGetSettlementsQuery } from "@/features/vendor/earningsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreEarnings({ storeId }: { storeId: string }) {
  const { data: summary, isLoading: isLoadingSummary, isError: isSummaryError } = useGetEarningsSummaryQuery(storeId);
  const { data: settlements = [], isLoading: isLoadingSettlements, isError: isSettlementsError } = useGetSettlementsQuery(storeId);

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Earnings</h1>
        <p className="vd-subtitle">Track what you&apos;ve made and what&apos;s been paid out.</p>
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
                <p className="vd-metric-card__value">{formatNaira(summary.todayEarnings)}</p>
                <p className="vd-metric-card__label">Today</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(summary.thisWeekEarnings)}</p>
                <p className="vd-metric-card__label">This week</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(summary.thisMonthEarnings)}</p>
                <p className="vd-metric-card__label">This month</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(summary.totalNetEarnings)}</p>
                <p className="vd-metric-card__label">Total net (settled)</p>
              </div>
            </div>
            <p className="vd-subtitle" style={{ marginTop: 10 }}>
              Today / this week / this month are estimates — TummyTime doesn&apos;t compute these from your real
              settlement history yet. Only &quot;Total net&quot; reflects the settlements below.
            </p>
          </>
        )}
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Settlements</h2>
        {isLoadingSettlements ? (
          <p className="vp-empty">Loading settlements…</p>
        ) : isSettlementsError ? (
          <div className="vp-empty">
            <p className="vp-empty-title">Couldn&apos;t load settlements</p>
            <p className="vp-empty-sub">Please check your connection and try again.</p>
          </div>
        ) : settlements.length === 0 ? (
          <p className="vp-empty">No settlements yet.</p>
        ) : (
          <div className="vd-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Other charges</th>
                  <th>Net</th>
                  <th>Payout date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td>{s.reference}</td>
                    <td>{formatNaira(Number(s.grossAmount))}</td>
                    <td>{formatNaira(Number(s.platformCommission))}</td>
                    <td>{formatNaira(Number(s.otherCharges ?? 0))}</td>
                    <td>{formatNaira(Number(s.netEarnings))}</td>
                    <td>{formatDate(s.payoutDate)}</td>
                    <td>
                      <span className={`op-badge op-badge--${s.status === "paid" ? "success" : "pending"}`}>{s.status}</span>
                    </td>
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
