import { mockDelay } from "@/lib/dev/devMode";
import type { RiderEarningEntry, RiderEarningsSummary } from "@/features/rider/types";
import { RIDER_BASE_DELIVERY_FEE } from "@/features/rider/constants";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Mirrors TMT-BE-V1's rewards-service riderEarnings ledger — same flat
 * per-delivery placeholder (see features/rider/constants.ts, kept in sync
 * with services/rewards-service/src/config.ts's RIDER_BASE_DELIVERY_FEE).
 * ═══════════════════════════════════════════════════════════════════════
 */

const RIDER_EARNINGS_KEY = "tummytime_mock_rider_earnings";

function load(): Record<string, RiderEarningEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RIDER_EARNINGS_KEY) ?? "{}") as Record<string, RiderEarningEntry[]>;
  } catch {
    return {};
  }
}

function save(all: Record<string, RiderEarningEntry[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RIDER_EARNINGS_KEY, JSON.stringify(all));
}

export function mockCreditRiderEarnings(riderId: string, orderId: string) {
  const all = load();
  const history = all[riderId] ?? [];
  history.unshift({
    id: crypto.randomUUID(),
    riderId,
    orderId,
    amount: RIDER_BASE_DELIVERY_FEE,
    createdAt: new Date().toISOString(),
  });
  all[riderId] = history;
  save(all);
}

export async function mockGetRiderEarningsSummary(riderId: string): Promise<RiderEarningsSummary> {
  await mockDelay();
  const history = load()[riderId] ?? [];
  return {
    totalEarnings: history.reduce((sum, e) => sum + Number(e.amount), 0),
    completedDeliveries: history.length,
  };
}

export async function mockGetRiderEarningsHistory(riderId: string): Promise<RiderEarningEntry[]> {
  await mockDelay();
  return load()[riderId] ?? [];
}
