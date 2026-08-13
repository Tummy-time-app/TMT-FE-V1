import { mockDelay } from "@/lib/dev/devMode";
import { findUserByReferralCode, referralCodeForUserId } from "@/lib/mocks/auth.mock";
import { creditWalletInternal } from "@/lib/mocks/wallet.mock";
import { pushNotificationInternal } from "@/lib/mocks/notifications.mock";
import type { Referral, ReferralSummary, RedeemReferralPayload } from "@/features/referrals/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * Simplified reward trigger: real referral programs often wait for the
 * referred user's first completed order before paying out (to discourage
 * throwaway signups). This mock pays out immediately on redemption — a
 * deliberate simplification so the whole loop (redeem → reward → visible
 * in the referrer's wallet) is demonstrable without also wiring into the
 * order-delivery lifecycle. Noted in backend-alignment-phases memory.
 */
const REFERRALS_STORAGE_KEY = "tummytime_mock_referrals";
const REWARD_AMOUNT = 500;

function loadReferrals(): Referral[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(REFERRALS_STORAGE_KEY) ?? "[]") as Referral[];
  } catch {
    return [];
  }
}

function saveReferrals(referrals: Referral[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
}

export async function mockGetReferralSummary(userId: string): Promise<ReferralSummary> {
  await mockDelay(300);
  const mine = loadReferrals().filter((r) => r.referrerId === userId);
  const code = referralCodeForUserId(userId);
  return {
    code,
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : `/register?ref=${code}`,
    totalReferred: mine.length,
    totalEarned: mine.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.rewardAmount, 0),
  };
}

export async function mockGetReferrals(userId: string): Promise<Referral[]> {
  await mockDelay(300);
  return loadReferrals()
    .filter((r) => r.referrerId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Doc §5, PromotionsModule: `POST /referrals`. Called once, right after a referred-by-code signup completes. */
export async function mockRedeemReferralCode({ code, referredId, referredName }: RedeemReferralPayload): Promise<Referral> {
  await mockDelay(500);

  const referrer = findUserByReferralCode(code);
  if (!referrer) throw { status: 404, message: "That referral code doesn't exist." };
  if (referrer.id === referredId) throw { status: 422, message: "You can't refer yourself." };

  const existing = loadReferrals();
  if (existing.some((r) => r.referredId === referredId)) {
    throw { status: 422, message: "This account has already redeemed a referral code." };
  }

  const referral: Referral = {
    id: `referral-${Date.now().toString(36)}`,
    referrerId: referrer.id,
    referredId,
    referredName,
    rewardAmount: REWARD_AMOUNT,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  saveReferrals([referral, ...existing]);

  creditWalletInternal(referrer.id, REWARD_AMOUNT, `Referral reward — ${referredName} joined with your code`);
  pushNotificationInternal(referrer.id, {
    type: "payment",
    title: "Referral reward earned",
    message: `${referredName} signed up with your code — ₦${REWARD_AMOUNT.toLocaleString("en-NG")} added to your wallet.`,
    link: "/referrals",
  });

  return referral;
}
