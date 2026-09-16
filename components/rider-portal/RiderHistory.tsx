"use client";

import { useAuth } from "@/features/auth/hooks";
import { useGetRiderEarningsHistoryQuery } from "@/features/rider/riderEarningsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Rendered inside RiderPortalShell. There's no separate "completed
 * deliveries" list endpoint — the rider-earnings ledger already has exactly
 * one row per completed delivery (orderId + amount + date), so this is that
 * same data read as delivery history rather than duplicating it behind a
 * second endpoint.
 */
export function RiderHistory() {
  const { user } = useAuth();
  const { data: history = [], isLoading, isError } = useGetRiderEarningsHistoryQuery(user?.id ?? "", { skip: !user });

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Delivery History</h1>
        <p className="vd-subtitle">Your completed deliveries.</p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading…</p>
      ) : isError ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load history</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : history.length === 0 ? (
        <p className="vp-empty">No completed deliveries yet.</p>
      ) : (
        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Earned</th>
                <th>Delivered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>#{entry.orderId.slice(0, 8)}</td>
                  <td>{formatNaira(Number(entry.amount))}</td>
                  <td>{formatDate(entry.createdAt)}</td>
                  <td>
                    <span className="op-badge op-badge--success">delivered</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
