/**
 * Mirrors TMT-BE-V1's services/rewards-service/src/config.ts — same numbers,
 * same "placeholder pending TummyTime's financial model" caveat (see the
 * UX/UI blueprint sections 24/30/37). Keep both files in sync. Used here for
 * client-side previews (the checkout "you'll earn ₦X cashback" line, the
 * add-money "+N Loyalty Points" preview) and by lib/mocks/rewards.mock.ts so
 * dev mode matches what the real backend would credit.
 */

export const CASHBACK_RATE = 0.004; // ₦500 order value = ₦2 cashback
export const MIN_CASHBACK = 2;

export function computeCashback(orderTotal: number): number {
  if (orderTotal <= 0) return 0;
  return Math.max(MIN_CASHBACK, Math.round(orderTotal * CASHBACK_RATE));
}

export const LOYALTY_DEPOSIT_THRESHOLD = 8000;
export const LOYALTY_POINTS_PER_NAIRA_DEPOSITED = 1 / 100; // 1 point per ₦100 deposited
export const LOYALTY_POINTS_PER_COMPLETED_ORDER = 20;
export const LOYALTY_REDEMPTION_RATE = 10 / 100; // 100 points = ₦10

export function computeLoyaltyPointsForDeposit(amount: number): number {
  if (amount < LOYALTY_DEPOSIT_THRESHOLD) return 0;
  return Math.round(amount * LOYALTY_POINTS_PER_NAIRA_DEPOSITED);
}

export const FREE_DELIVERY_MILESTONE = 3;

export const REDEMPTION_TIERS = [1000, 2500, 5000];

export const WALLET_QUICK_AMOUNTS = [8000, 10000, 20000, 50000, 100000];
