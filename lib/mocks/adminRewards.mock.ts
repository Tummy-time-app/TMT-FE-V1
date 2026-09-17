import { mockDelay } from "@/lib/dev/devMode";
import { getPlatformRewardsAggregate } from "./rewards.mock";
import { getTotalRiderEarningsPaid } from "./riderEarnings.mock";
import type { AdminRewardsSummary } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors rewards-service's real GET /api/v1/admin/rewards/summary — same
 * numbers, just summed client-side over localStorage instead of SQL.
 * ═══════════════════════════════════════════════════════════════════════
 */
export async function mockGetAdminRewardsSummary(): Promise<AdminRewardsSummary> {
  await mockDelay();
  return { ...getPlatformRewardsAggregate(), totalRiderEarningsPaid: getTotalRiderEarningsPaid() };
}
