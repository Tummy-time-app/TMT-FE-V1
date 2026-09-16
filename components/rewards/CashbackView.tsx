"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetCashbackSummaryQuery } from "@/features/rewards/rewardsApi";
import { CASHBACK_RATE, MIN_CASHBACK } from "@/features/rewards/constants";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const RATE_EXAMPLES = [500, 1000, 2500, 5000, 10000, 20000, 50000];

export function CashbackView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/cashback");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data: cashback, isLoading } = useGetCashbackSummaryQuery(user?.id ?? "", { skip: !user });

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="rwd-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main className="rwd-root">
      <header className="rwd-header">
        <h1 className="rwd-title">Cashback</h1>
        <p className="rwd-subtitle">
          Earn {formatNaira(MIN_CASHBACK)} minimum, or {(CASHBACK_RATE * 100).toFixed(1)}% back on every eligible order —
          credited to your Wallet once the order is completed.
        </p>
      </header>

      <div className="rwd-balance-card">
        <p className="rwd-balance-card__label">Total Cashback Earned</p>
        <p className="rwd-balance-card__value">{isLoading ? "…" : formatNaira(cashback?.totalEarned ?? 0)}</p>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">How it works</h2>
        <div className="rwd-list-wrap" style={{ overflowX: "auto" }}>
          <table className="rwd-rate-table">
            <thead>
              <tr>
                <th>Order value</th>
                <th>Cashback earned</th>
              </tr>
            </thead>
            <tbody>
              {RATE_EXAMPLES.map((value) => (
                <tr key={value}>
                  <td>{formatNaira(value)}</td>
                  <td>{formatNaira(Math.max(MIN_CASHBACK, Math.round(value * CASHBACK_RATE)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">History</h2>
        {isLoading ? (
          <p className="vp-empty">Loading…</p>
        ) : !cashback || cashback.history.length === 0 ? (
          <p className="vp-empty">No cashback earned yet — place an order to start earning.</p>
        ) : (
          <div className="rwd-list">
            {cashback.history.map((entry) => (
              <div className="rwd-list-row" key={entry.id}>
                <div>
                  <p className="rwd-list-row__label">Order #{entry.orderId.slice(0, 8)}</p>
                  <p className="rwd-list-row__date">{formatDate(entry.createdAt)}</p>
                </div>
                <p className="rwd-list-row__amount rwd-list-row__amount--positive">+{formatNaira(Number(entry.amount))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
