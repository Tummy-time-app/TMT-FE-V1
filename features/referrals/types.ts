/** Maps to the `referrals` table (doc §4 "Promotions, reviews, support"). */
export type ReferralStatus = "pending" | "completed";

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  rewardAmount: number;
  status: ReferralStatus;
  createdAt: string;
}

export interface RedeemReferralPayload {
  code: string;
  referredId: string;
  referredName: string;
}

export interface ReferralSummary {
  code: string;
  shareUrl: string;
  totalReferred: number;
  totalEarned: number;
}
