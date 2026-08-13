/**
 * Maps to `transactions.type` (doc §4 "Payments & wallet"). The full
 * backend enum also has `vendor_payout`/`rider_payout`/`commission` —
 * those show up on vendor/rider wallets, not the customer wallet this
 * feature models, so they're omitted here rather than left unreachable.
 */
export type WalletTransactionType = "wallet_topup" | "order_payment" | "refund" | "wallet_withdrawal";
/** Maps to `transactions.status`. */
export type WalletTransactionStatus = "pending" | "success" | "failed" | "reversed";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  /** Positive for credits (topup, refund), negative for debits (payment, withdrawal). */
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  createdAt: string;
  /** Maps to `transactions.provider_reference` — the idempotency key a webhook matches on. Unset for wallet-internal transactions (e.g. an order paid from wallet balance) that never touch a payment provider. */
  providerReference?: string;
  /** Maps to `transactions.user_id`. Only populated on the admin "every transaction" reconciliation view — a customer's own query is already scoped to their wallet. */
  userId?: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export type TopUpMethod = "card" | "bank_transfer";

export interface TopUpPayload {
  userId: string;
  amount: number;
  method: TopUpMethod;
}
