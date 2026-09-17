import { mockDelay } from "@/lib/dev/devMode";
import type {
  Wallet,
  WalletTransaction,
  WalletTransactionType,
  CashbackEntry,
  LoyaltyHistoryEntry,
  LoyaltyReason,
  FreeDeliveryHistoryEntry,
  FreeDeliveryProgress,
  OrderRewardSummary,
  RedemptionOption,
} from "@/features/rewards/types";
import {
  computeCashback,
  computeLoyaltyPointsForDeposit,
  LOYALTY_DEPOSIT_THRESHOLD,
  LOYALTY_POINTS_PER_COMPLETED_ORDER,
  LOYALTY_REDEMPTION_RATE,
  FREE_DELIVERY_MILESTONE,
  REDEMPTION_TIERS,
} from "@/features/rewards/constants";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Unlike most mocks in this directory, TMT-BE-V1 now has a real
 * rewards-service behind this feature — this mock exists purely so the app
 * works without that backend running locally, mirroring the exact same
 * ledger math (see features/rewards/constants.ts, kept in sync with
 * services/rewards-service/src/config.ts).
 *
 * One deliberate simplification: the real backend credits cashback/loyalty/
 * free-delivery progress off an order reaching "delivered" (an event fired
 * by order-service — see rewards-service/src/events/orderConsumer.ts). No
 * rider/admin app exists yet to actually mark an order delivered, so dev
 * mode has nothing to simulate that transition either. `mockSettleOrderRewards`
 * is instead called right at order creation (see orders.mock.ts's
 * mockCreateOrder) so the post-checkout reward summary is still demoable.
 * ═══════════════════════════════════════════════════════════════════════
 */

const REWARDS_KEY = "tummytime_mock_rewards";

interface RewardsState {
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  loyaltyBalance: number;
  loyaltyHistory: LoyaltyHistoryEntry[];
  cashbackHistory: CashbackEntry[];
  freeDelivery: { ordersTowardReward: number; creditsAvailable: number };
  freeDeliveryHistory: FreeDeliveryHistoryEntry[];
}

function emptyState(): RewardsState {
  return {
    walletBalance: 0,
    walletTransactions: [],
    loyaltyBalance: 0,
    loyaltyHistory: [],
    cashbackHistory: [],
    freeDelivery: { ordersTowardReward: 0, creditsAvailable: 0 },
    freeDeliveryHistory: [],
  };
}

function loadAll(): Record<string, RewardsState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(REWARDS_KEY) ?? "{}") as Record<string, RewardsState>;
  } catch {
    return {};
  }
}

function saveAll(all: Record<string, RewardsState>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REWARDS_KEY, JSON.stringify(all));
}

function getState(userId: string): RewardsState {
  const all = loadAll();
  return all[userId] ?? emptyState();
}

function setState(userId: string, state: RewardsState) {
  const all = loadAll();
  all[userId] = state;
  saveAll(all);
}

function applyWalletDelta(
  state: RewardsState,
  amount: number,
  type: WalletTransactionType,
  options: { orderId?: string; reference?: string } = {}
): WalletTransaction {
  const newBalance = state.walletBalance + amount;
  if (newBalance < 0) {
    throw { status: 402, message: "Insufficient wallet balance" };
  }
  state.walletBalance = newBalance;
  const transaction: WalletTransaction = {
    id: crypto.randomUUID(),
    userId: "",
    type,
    amount,
    balanceAfter: newBalance,
    orderId: options.orderId,
    reference: options.reference,
    createdAt: new Date().toISOString(),
  };
  state.walletTransactions.unshift(transaction);
  return transaction;
}

function addLoyaltyPoints(state: RewardsState, delta: number, reason: LoyaltyReason, orderId?: string) {
  state.loyaltyBalance = Math.max(0, state.loyaltyBalance + delta);
  state.loyaltyHistory.unshift({
    id: crypto.randomUUID(),
    userId: "",
    delta,
    reason,
    orderId,
    createdAt: new Date().toISOString(),
  });
}

function recordCompletedOrder(state: RewardsState, orderId: string) {
  const ordersTowardReward = state.freeDelivery.ordersTowardReward + 1;
  const milestoneReached = ordersTowardReward >= FREE_DELIVERY_MILESTONE;
  state.freeDelivery.ordersTowardReward = milestoneReached ? 0 : ordersTowardReward;
  if (milestoneReached) {
    state.freeDelivery.creditsAvailable += 1;
    state.freeDeliveryHistory.unshift({
      id: crypto.randomUUID(),
      userId: "",
      event: "earned",
      orderId,
      createdAt: new Date().toISOString(),
    });
  }
}

function creditCashback(state: RewardsState, orderId: string, orderTotal: number): number {
  const amount = computeCashback(orderTotal);
  state.cashbackHistory.unshift({
    id: crypto.randomUUID(),
    userId: "",
    orderId,
    amount,
    createdAt: new Date().toISOString(),
  });
  applyWalletDelta(state, amount, "cashback_credit", { orderId, reference: `Cashback for order ${orderId}` });
  return amount;
}

// ── Wallet ──────────────────────────────────────────────────────────

export async function mockGetWallet(userId: string): Promise<Wallet> {
  await mockDelay();
  const state = getState(userId);
  return { id: userId, userId, balance: state.walletBalance };
}

export async function mockGetWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  await mockDelay();
  return getState(userId).walletTransactions;
}

export async function mockDepositWallet(userId: string, amount: number): Promise<{ wallet: Wallet; pointsAwarded: number }> {
  await mockDelay();
  const state = getState(userId);
  applyWalletDelta(state, amount, "deposit", { reference: "Wallet top-up" });
  const pointsAwarded = computeLoyaltyPointsForDeposit(amount);
  if (pointsAwarded > 0) addLoyaltyPoints(state, pointsAwarded, "wallet_deposit");
  setState(userId, state);
  return { wallet: { id: userId, userId, balance: state.walletBalance }, pointsAwarded };
}

/** Used by orders.mock.ts to debit the wallet synchronously when "Pay with Wallet" is chosen at checkout. */
export async function mockDebitWalletForOrder(userId: string, amount: number, orderId: string): Promise<void> {
  const state = getState(userId);
  applyWalletDelta(state, -amount, "order_payment", { orderId });
  setState(userId, state);
}

// ── Cashback ────────────────────────────────────────────────────────

export async function mockGetCashbackSummary(userId: string): Promise<{ totalEarned: number; history: CashbackEntry[] }> {
  await mockDelay();
  const state = getState(userId);
  const totalEarned = state.cashbackHistory.reduce((sum, row) => sum + Number(row.amount), 0);
  return { totalEarned, history: state.cashbackHistory };
}

// ── Loyalty points ──────────────────────────────────────────────────

export async function mockGetLoyaltyBalance(userId: string): Promise<{ balance: number; history: LoyaltyHistoryEntry[]; depositThreshold: number }> {
  await mockDelay();
  const state = getState(userId);
  return { balance: state.loyaltyBalance, history: state.loyaltyHistory, depositThreshold: LOYALTY_DEPOSIT_THRESHOLD };
}

export async function mockGetRedemptionOptions(): Promise<RedemptionOption[]> {
  await mockDelay(150);
  return REDEMPTION_TIERS.map((points) => ({ points, nairaValue: Math.round(points * LOYALTY_REDEMPTION_RATE) }));
}

export async function mockRedeemPoints(userId: string, points: number): Promise<{ balance: number; nairaCredited: number }> {
  await mockDelay();
  const state = getState(userId);
  if (state.loyaltyBalance < points) {
    throw { status: 400, message: "Insufficient loyalty points" };
  }
  addLoyaltyPoints(state, -points, "redemption");
  const nairaCredited = Math.round(points * LOYALTY_REDEMPTION_RATE);
  applyWalletDelta(state, nairaCredited, "loyalty_redemption", { reference: `Redeemed ${points} points` });
  setState(userId, state);
  return { balance: state.loyaltyBalance, nairaCredited };
}

// ── Free delivery ───────────────────────────────────────────────────

export async function mockGetFreeDeliveryProgress(
  userId: string
): Promise<{ progress: FreeDeliveryProgress; history: FreeDeliveryHistoryEntry[] }> {
  await mockDelay();
  const state = getState(userId);
  return {
    progress: {
      id: userId,
      userId,
      ordersTowardReward: state.freeDelivery.ordersTowardReward,
      creditsAvailable: state.freeDelivery.creditsAvailable,
    },
    history: state.freeDeliveryHistory,
  };
}

// ── Post-order settlement (see this file's doc comment for why this fires
//    at order creation rather than order delivery) ────────────────────

export async function mockSettleOrderRewards(userId: string, orderId: string, totalAmount: number): Promise<OrderRewardSummary> {
  const state = getState(userId);
  const cashbackEarned = creditCashback(state, orderId, totalAmount);
  addLoyaltyPoints(state, LOYALTY_POINTS_PER_COMPLETED_ORDER, "order_completed", orderId);
  const priorCredits = state.freeDelivery.creditsAvailable;
  recordCompletedOrder(state, orderId);
  const freeDeliveryEarned = state.freeDelivery.creditsAvailable > priorCredits;
  setState(userId, state);

  return {
    orderId,
    cashbackEarned,
    loyaltyPointsEarned: LOYALTY_POINTS_PER_COMPLETED_ORDER,
    freeDeliveryEarned,
    freeDeliveryProgress: {
      id: userId,
      userId,
      ordersTowardReward: state.freeDelivery.ordersTowardReward,
      creditsAvailable: state.freeDelivery.creditsAvailable,
    },
  };
}

export async function mockGetOrderRewardSummary(userId: string, orderId: string): Promise<OrderRewardSummary> {
  await mockDelay(150);
  const state = getState(userId);
  return {
    orderId,
    cashbackEarned: state.cashbackHistory.filter((c) => c.orderId === orderId).reduce((sum, c) => sum + Number(c.amount), 0),
    loyaltyPointsEarned: state.loyaltyHistory.filter((l) => l.orderId === orderId).reduce((sum, l) => sum + l.delta, 0),
    freeDeliveryEarned: state.freeDeliveryHistory.some((f) => f.orderId === orderId && f.event === "earned"),
    freeDeliveryProgress: {
      id: userId,
      userId,
      ordersTowardReward: state.freeDelivery.ordersTowardReward,
      creditsAvailable: state.freeDelivery.creditsAvailable,
    },
  };
}

/** For the Admin dashboard's Rewards page — mirrors adminRewards.ts's real GET /summary, summed across every user's state instead of SQL aggregates. */
export function getPlatformRewardsAggregate() {
  const all = Object.values(loadAll());
  let totalCashbackIssued = 0;
  let totalWalletDeposits = 0;
  let totalWalletBalance = 0;
  let loyaltyPointsOutstanding = 0;
  let freeDeliveriesEarned = 0;
  let freeDeliveriesUsed = 0;
  let freeDeliveriesExpired = 0;

  for (const state of all) {
    totalCashbackIssued += state.cashbackHistory.reduce((sum, c) => sum + Number(c.amount), 0);
    totalWalletDeposits += state.walletTransactions.filter((t) => t.type === "deposit").reduce((sum, t) => sum + Number(t.amount), 0);
    totalWalletBalance += state.walletBalance;
    loyaltyPointsOutstanding += state.loyaltyBalance;
    freeDeliveriesEarned += state.freeDeliveryHistory.filter((f) => f.event === "earned").length;
    freeDeliveriesUsed += state.freeDeliveryHistory.filter((f) => f.event === "used").length;
    freeDeliveriesExpired += state.freeDeliveryHistory.filter((f) => f.event === "expired").length;
  }

  return { totalCashbackIssued, totalWalletDeposits, totalWalletBalance, loyaltyPointsOutstanding, freeDeliveriesEarned, freeDeliveriesUsed, freeDeliveriesExpired };
}
