/** Maps to `payouts.status` (doc §4: `pending, processing, paid, failed`). */
export type WithdrawalStatus = "pending" | "processing" | "paid" | "failed";

export interface Withdrawal {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  /** Only populated on the admin "every withdrawal" view — a vendor/rider's own list is already scoped by the query arg. */
  actorId?: string;
}
