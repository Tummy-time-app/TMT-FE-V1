"use client";

import Link from "next/link";
import { useGetOrderRewardSummaryQuery } from "@/features/rewards/rewardsApi";
import { FREE_DELIVERY_MILESTONE } from "@/features/rewards/constants";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * Rendered by OrderDetail once an order reaches "delivered" (blueprint
 * screens 34/36 — "You earned rewards!"). Cashback/loyalty/free-delivery
 * credit on delivery, not at checkout — see the rider-app implementation
 * plan and lib/mocks/riderOrders.mock.ts's mockRiderDeliver, which settles
 * this the same moment order-service's real riderOrders.ts /:id/deliver
 * endpoint does. Fetches by orderId rather than trusting an embedded value,
 * matching the real rewards-service contract (GET /api/rewards/summary/order/:id).
 */
export function RewardSummary({ userId, orderId, restaurantId }: { userId: string; orderId: string; restaurantId?: string }) {
  const { data: summary, isLoading } = useGetOrderRewardSummaryQuery({ userId, orderId });

  const ordersRemaining = summary
    ? Math.max(0, FREE_DELIVERY_MILESTONE - summary.freeDeliveryProgress.ordersTowardReward)
    : FREE_DELIVERY_MILESTONE;

  return (
    <div className="rwd-summary-panel">
      <p className="rwd-summary-emoji">🎉</p>
      <h1 className="rwd-summary-title">You earned rewards!</h1>

      {isLoading || !summary ? (
        <p className="vp-empty">Loading your rewards…</p>
      ) : (
        <>
          <div className="rwd-summary-rows">
            <div className="rwd-summary-row">
              <span>Cashback</span>
              <span className="rwd-summary-row__value">+{formatNaira(summary.cashbackEarned)}</span>
            </div>
            <div className="rwd-summary-row">
              <span>Loyalty Points</span>
              <span className="rwd-summary-row__value">+{summary.loyaltyPointsEarned} Points</span>
            </div>
            <div className="rwd-summary-row">
              <span>Free Delivery Progress</span>
              <span className="rwd-summary-row__value">
                {summary.freeDeliveryProgress.ordersTowardReward}/{FREE_DELIVERY_MILESTONE} Orders
              </span>
            </div>
          </div>

          <p className="rwd-summary-message">
            {summary.freeDeliveryEarned
              ? "You've unlocked a free delivery!"
              : `Complete ${ordersRemaining} more order${ordersRemaining !== 1 ? "s" : ""} to unlock FREE DELIVERY.`}
          </p>
        </>
      )}

      <div className="rwd-summary-actions">
        <Link href="/wallet" className="rwd-btn rwd-btn--primary">
          View Rewards
        </Link>
        <Link href={restaurantId ? `/vendors/restaurants/${restaurantId}` : "/vendors/restaurants"} className="rwd-btn rwd-btn--ghost">
          Order Again
        </Link>
      </div>
    </div>
  );
}
