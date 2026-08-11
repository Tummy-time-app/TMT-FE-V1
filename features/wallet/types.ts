export type WalletTransactionType = "topup" | "payment" | "refund";
export type WalletTransactionStatus = "pending" | "completed" | "failed";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  /** Positive for credits (topup, refund), negative for debits (payment). */
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  createdAt: string;
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
