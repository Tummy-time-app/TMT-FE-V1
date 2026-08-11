import { mockDelay } from "@/lib/dev/devMode";
import type { Withdrawal } from "@/features/payouts/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * Shared withdrawal ledger for vendors and riders — their "available
 * balance" is computed by the caller (revenue from completed orders,
 * already fetchable via ordersApi) minus the sum of withdrawals here.
 * Keeps this store tiny: it only ever records money moving *out*.
 */

const WITHDRAWALS_STORAGE_KEY = "tummytime_mock_withdrawals";

type WithdrawalStore = Record<string, Withdrawal[]>;

function loadStore(): WithdrawalStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(WITHDRAWALS_STORAGE_KEY) ?? "{}") as WithdrawalStore;
  } catch {
    return {};
  }
}

function saveStore(store: WithdrawalStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WITHDRAWALS_STORAGE_KEY, JSON.stringify(store));
}

export async function mockGetWithdrawals(actorId: string): Promise<Withdrawal[]> {
  await mockDelay(300);
  const store = loadStore();
  return [...(store[actorId] ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockCreateWithdrawal(actorId: string, amount: number, availableBalance: number): Promise<Withdrawal> {
  await mockDelay(700);
  if (amount <= 0) throw { status: 422, message: "Enter an amount greater than zero." };
  if (amount > availableBalance) throw { status: 422, message: "You can't withdraw more than your available balance." };

  const store = loadStore();
  const withdrawal: Withdrawal = {
    id: `WD-${Date.now().toString(36).toUpperCase()}`,
    amount,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  store[actorId] = [withdrawal, ...(store[actorId] ?? [])];
  saveStore(store);
  return withdrawal;
}
