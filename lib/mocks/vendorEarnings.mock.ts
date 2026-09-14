import { mockDelay } from "@/lib/dev/devMode";
import type { EarningsSummary, Settlement } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Like vendorReviews.mock.ts, nothing in this app generates real
 * settlements, so this lazily seeds a fixed set per restaurantId on first
 * read, persisted to localStorage. `totalNetEarnings` is computed as the
 * real sum of the seeded rows — mirroring that this is the one field the
 * real backend actually aggregates; the other three headline numbers are
 * fixed illustrative figures, matching the real backend's own hardcoded
 * placeholder behavior (see vendor.ts's /earnings route comment).
 * ═══════════════════════════════════════════════════════════════════════
 */

const SETTLEMENTS_KEY = "tummytime_mock_settlements";

const SAMPLE_SETTLEMENTS: { grossAmount: number; commissionRate: number; otherCharges: number; status: Settlement["status"]; daysAgo: number }[] = [
  { grossAmount: 45000, commissionRate: 0.15, otherCharges: 500, status: "paid", daysAgo: 28 },
  { grossAmount: 62000, commissionRate: 0.15, otherCharges: 500, status: "paid", daysAgo: 21 },
  { grossAmount: 38500, commissionRate: 0.15, otherCharges: 0, status: "paid", daysAgo: 14 },
  { grossAmount: 71200, commissionRate: 0.15, otherCharges: 750, status: "paid", daysAgo: 7 },
  { grossAmount: 29800, commissionRate: 0.15, otherCharges: 0, status: "pending", daysAgo: 1 },
];

function load(): Record<string, Settlement[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SETTLEMENTS_KEY) ?? "{}") as Record<string, Settlement[]>;
  } catch {
    return {};
  }
}

function save(data: Record<string, Settlement[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify(data));
}

function seedSettlements(restaurantId: string): Settlement[] {
  const now = Date.now();
  return SAMPLE_SETTLEMENTS.map((sample, i) => {
    const platformCommission = Math.round(sample.grossAmount * sample.commissionRate);
    const netEarnings = sample.grossAmount - platformCommission - sample.otherCharges;
    const payoutDate = new Date(now - sample.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: crypto.randomUUID(),
      restaurantId,
      reference: `STL-${String(i + 1).padStart(4, "0")}`,
      grossAmount: sample.grossAmount,
      platformCommission,
      otherCharges: sample.otherCharges,
      netEarnings,
      payoutDate,
      status: sample.status,
      createdAt: payoutDate,
    };
  });
}

function getOrSeed(restaurantId: string): Settlement[] {
  const all = load();
  let settlements = all[restaurantId];
  if (!settlements) {
    settlements = seedSettlements(restaurantId);
    all[restaurantId] = settlements;
    save(all);
  }
  return settlements;
}

export async function mockGetEarningsSummary(restaurantId: string): Promise<EarningsSummary> {
  await mockDelay();
  const settlements = getOrSeed(restaurantId);
  return {
    todayEarnings: 18500,
    thisWeekEarnings: 92000,
    thisMonthEarnings: 385000,
    totalNetEarnings: settlements.reduce((sum, s) => sum + Number(s.netEarnings), 0),
    settlementsCount: settlements.length,
  };
}

export async function mockGetSettlements(restaurantId: string): Promise<Settlement[]> {
  await mockDelay();
  return getOrSeed(restaurantId)
    .slice()
    .sort((a, b) => new Date(b.payoutDate ?? 0).getTime() - new Date(a.payoutDate ?? 0).getTime());
}
