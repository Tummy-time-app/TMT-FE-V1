/**
 * Mirrors TMT-BE-V1's new rewards-service (services/rewards-service/src/db/
 * schema.ts + routes/rewards.ts) — a real backend now exists for these, so
 * (unlike features/shops/types.ts) this isn't a speculative placeholder
 * contract. Monetary fields are typed `string | number` matching
 * features/vendor/types.ts's Settlement convention (Postgres numeric columns
 * come back as strings from Drizzle).
 */

export interface Wallet {
  id: string;
  userId: string;
  balance: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export type WalletTransactionType = "deposit" | "order_payment" | "cashback_credit" | "refund" | "loyalty_redemption";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: string | number;
  balanceAfter: string | number;
  reference?: string | null;
  orderId?: string | null;
  createdAt: string;
}

export interface CashbackEntry {
  id: string;
  userId: string;
  orderId: string;
  amount: string | number;
  createdAt: string;
}

export interface CashbackSummary {
  totalEarned: number;
  history: CashbackEntry[];
}

export type LoyaltyReason = "wallet_deposit" | "order_completed" | "redemption" | "promotion" | "referral";

export interface LoyaltyBalance {
  id: string;
  userId: string;
  balance: number;
  updatedAt?: string;
}

export interface LoyaltyHistoryEntry {
  id: string;
  userId: string;
  delta: number;
  reason: LoyaltyReason;
  orderId?: string | null;
  createdAt: string;
}

export interface RedemptionOption {
  points: number;
  nairaValue: number;
}

export interface FreeDeliveryProgress {
  id: string;
  userId: string;
  ordersTowardReward: number;
  creditsAvailable: number;
  updatedAt?: string;
}

export type FreeDeliveryEvent = "earned" | "used" | "expired";

export interface FreeDeliveryHistoryEntry {
  id: string;
  userId: string;
  event: FreeDeliveryEvent;
  orderId?: string | null;
  createdAt: string;
}

export interface OrderRewardSummary {
  orderId: string;
  cashbackEarned: number;
  loyaltyPointsEarned: number;
  freeDeliveryEarned: boolean;
  freeDeliveryProgress: FreeDeliveryProgress;
}
