"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetLoyaltyBalanceQuery,
  useGetRedemptionOptionsQuery,
  useRedeemPointsMutation,
} from "@/features/rewards/rewardsApi";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const REASON_LABELS: Record<string, string> = {
  wallet_deposit: "Wallet deposit",
  order_completed: "Completed order",
  redemption: "Redeemed",
  promotion: "Promotion",
  referral: "Referral",
};

export function LoyaltyView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemingPoints, setRedeemingPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/loyalty-points");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data: loyalty, isLoading } = useGetLoyaltyBalanceQuery(user?.id ?? "", { skip: !user });
  const { data: options = [] } = useGetRedemptionOptionsQuery();
  const [redeemPoints, { isLoading: isRedeeming }] = useRedeemPointsMutation();

  const handleRedeem = async (points: number) => {
    if (!user) return;
    setRedeemError(null);
    setRedeemingPoints(points);
    try {
      await redeemPoints({ userId: user.id, points }).unwrap();
    } catch (err) {
      setRedeemError(normalizeApiError(err as never).message);
    } finally {
      setRedeemingPoints(null);
    }
  };

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="rwd-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  const balance = loyalty?.balance ?? 0;

  return (
    <main className="rwd-root">
      <header className="rwd-header">
        <h1 className="rwd-title">Loyalty Points</h1>
        <p className="rwd-subtitle">
          Deposit {formatNaira(loyalty?.depositThreshold ?? 8000)} or more into your Wallet to start earning points, plus
          more on every completed order.
        </p>
      </header>

      <div className="rwd-balance-card">
        <p className="rwd-balance-card__label">Your Loyalty Points</p>
        <p className="rwd-balance-card__value">{isLoading ? "…" : `${balance.toLocaleString("en-NG")} Points`}</p>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">Redeem for Wallet Credit</h2>
        {redeemError && <p className="rwd-modal__error">{redeemError}</p>}
        <div className="rwd-redeem-grid">
          {options.map((option) => (
            <div className="rwd-redeem-card" key={option.points}>
              <p className="rwd-redeem-card__points">{option.points.toLocaleString("en-NG")} pts</p>
              <p className="rwd-redeem-card__value">→ {formatNaira(option.nairaValue)}</p>
              <button
                className="rwd-btn rwd-btn--primary"
                disabled={balance < option.points || isRedeeming}
                onClick={() => handleRedeem(option.points)}
              >
                {redeemingPoints === option.points ? "Redeeming…" : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">How you earned them</h2>
        {isLoading ? (
          <p className="vp-empty">Loading…</p>
        ) : !loyalty || loyalty.history.length === 0 ? (
          <p className="vp-empty">No loyalty activity yet.</p>
        ) : (
          <div className="rwd-list">
            {loyalty.history.map((entry) => (
              <div className="rwd-list-row" key={entry.id}>
                <div>
                  <p className="rwd-list-row__label">{REASON_LABELS[entry.reason] ?? entry.reason}</p>
                  <p className="rwd-list-row__date">{formatDate(entry.createdAt)}</p>
                </div>
                <p className={`rwd-list-row__amount rwd-list-row__amount--${entry.delta >= 0 ? "positive" : "negative"}`}>
                  {entry.delta >= 0 ? "+" : ""}
                  {entry.delta} pts
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
