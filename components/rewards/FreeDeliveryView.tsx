"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetFreeDeliveryProgressQuery } from "@/features/rewards/rewardsApi";
import { FREE_DELIVERY_MILESTONE } from "@/features/rewards/constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const EVENT_LABELS: Record<string, string> = {
  earned: "Free delivery earned",
  used: "Free delivery used",
  expired: "Free delivery expired",
};

export function FreeDeliveryView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/free-deliveries");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data, isLoading } = useGetFreeDeliveryProgressQuery(user?.id ?? "", { skip: !user });

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="rwd-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  const ordersTowardReward = data?.progress.ordersTowardReward ?? 0;
  const creditsAvailable = data?.progress.creditsAvailable ?? 0;
  const ordersRemaining = Math.max(0, FREE_DELIVERY_MILESTONE - ordersTowardReward);
  const progressPct = Math.min(100, Math.round((ordersTowardReward / FREE_DELIVERY_MILESTONE) * 100));

  return (
    <main className="rwd-root">
      <header className="rwd-header">
        <h1 className="rwd-title">Free Delivery Rewards</h1>
        <p className="rwd-subtitle">Complete {FREE_DELIVERY_MILESTONE} orders to unlock a free delivery.</p>
      </header>

      <div className="rwd-balance-card">
        <p className="rwd-balance-card__label">Free Deliveries Available</p>
        <p className="rwd-balance-card__value">{isLoading ? "…" : creditsAvailable}</p>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">Your Progress</h2>
        <p className="rwd-subtitle" style={{ margin: 0 }}>
          {ordersTowardReward}/{FREE_DELIVERY_MILESTONE} orders completed
        </p>
        <div className="rwd-progress-track">
          <div className="rwd-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="rwd-subtitle">
          {ordersRemaining === 0
            ? "You've unlocked a free delivery!"
            : `${ordersRemaining} more order${ordersRemaining !== 1 ? "s" : ""} to unlock FREE DELIVERY`}
        </p>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">History</h2>
        {isLoading ? (
          <p className="vp-empty">Loading…</p>
        ) : !data || data.history.length === 0 ? (
          <p className="vp-empty">No free delivery activity yet.</p>
        ) : (
          <div className="rwd-list">
            {data.history.map((entry) => (
              <div className="rwd-list-row" key={entry.id}>
                <div>
                  <p className="rwd-list-row__label">{EVENT_LABELS[entry.event] ?? entry.event}</p>
                  <p className="rwd-list-row__date">{formatDate(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
