import { mockDelay } from "@/lib/dev/devMode";
import { pushNotificationInternal } from "@/lib/mocks/notifications.mock";
import type { Withdrawal, WithdrawalStatus } from "@/features/payouts/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * Shared withdrawal ledger for vendors and riders — their "available
 * balance" is computed by the caller (revenue from completed orders,
 * already fetchable via ordersApi) minus the sum of withdrawals here,
 * regardless of status — a pending/processing withdrawal still reserves
 * the funds, same as most real payout systems. Keeps this store tiny: it
 * only ever records money moving *out*.
 *
 * A real admin approval workflow now backs this (doc's `payouts.status`
 * enum was previously typed but unused — every withdrawal auto-completed
 * to "paid" instantly, see [[backend-alignment-phases]]'s Phase 13.6
 * notes). New withdrawals start "pending"; an admin moves them to
 * "processing" → "paid", or "failed".
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
    status: "pending",
    createdAt: new Date().toISOString(),
    actorId,
  };
  store[actorId] = [withdrawal, ...(store[actorId] ?? [])];
  saveStore(store);
  return withdrawal;
}

/** Admin — every withdrawal on the platform, across every vendor and rider. */
export async function mockGetAllWithdrawals(): Promise<Withdrawal[]> {
  await mockDelay(400);
  const store = loadStore();
  return Object.entries(store)
    .flatMap(([actorId, list]) => list.map((w) => ({ ...w, actorId })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Admin — move a withdrawal through pending → processing → paid, or reject it as failed. */
export async function mockSetWithdrawalStatus(actorId: string, id: string, status: WithdrawalStatus): Promise<Withdrawal> {
  await mockDelay(500);
  const store = loadStore();
  const list = store[actorId] ?? [];
  const idx = list.findIndex((w) => w.id === id);
  if (idx === -1) throw { status: 404, message: "Withdrawal not found." };

  const updated: Withdrawal = { ...list[idx], status };
  const next = [...list];
  next[idx] = updated;
  store[actorId] = next;
  saveStore(store);

  pushNotificationInternal(actorId, {
    type: "payment",
    title: status === "paid" ? "Withdrawal paid" : status === "failed" ? "Withdrawal failed" : "Withdrawal update",
    message:
      status === "paid"
        ? `Your withdrawal of ₦${updated.amount.toLocaleString("en-NG")} has been paid out.`
        : status === "failed"
          ? `Your withdrawal of ₦${updated.amount.toLocaleString("en-NG")} couldn't be processed — contact support.`
          : `Your withdrawal of ₦${updated.amount.toLocaleString("en-NG")} is now processing.`,
    link: "/wallet",
  });

  return updated;
}
