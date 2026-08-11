import { mockDelay } from "@/lib/dev/devMode";
import { pushNotificationInternal } from "@/lib/mocks/notifications.mock";
import type { TopUpMethod, WalletTransaction } from "@/features/wallet/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 * One real, mutable wallet ledger per user, in localStorage.
 */

interface StoredWallet {
  balance: number;
  transactions: WalletTransaction[];
}

const WALLET_STORAGE_KEY = "tummytime_mock_wallets";

type WalletStore = Record<string, StoredWallet>;

function loadStore(): WalletStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(WALLET_STORAGE_KEY) ?? "{}") as WalletStore;
  } catch {
    return {};
  }
}

function saveStore(store: WalletStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(store));
}

function getOrInitWallet(store: WalletStore, userId: string): StoredWallet {
  if (!store[userId]) {
    store[userId] = { balance: 0, transactions: [] };
  }
  return store[userId];
}

export async function mockGetWallet(userId: string): Promise<{ balance: number }> {
  await mockDelay(300);
  const store = loadStore();
  return { balance: getOrInitWallet(store, userId).balance };
}

export async function mockGetWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  await mockDelay(350);
  const store = loadStore();
  return [...getOrInitWallet(store, userId).transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockTopUpWallet(userId: string, amount: number, method: TopUpMethod): Promise<WalletTransaction> {
  await mockDelay(900);
  if (amount <= 0) throw { status: 422, message: "Enter an amount greater than zero." };

  const store = loadStore();
  const wallet = getOrInitWallet(store, userId);
  const transaction: WalletTransaction = {
    id: `WTX-${Date.now().toString(36).toUpperCase()}`,
    type: "topup",
    amount,
    status: "completed",
    description: method === "card" ? "Top up via card" : "Top up via bank transfer",
    createdAt: new Date().toISOString(),
  };
  wallet.balance += amount;
  wallet.transactions = [transaction, ...wallet.transactions];
  saveStore(store);

  pushNotificationInternal(userId, {
    type: "payment",
    title: "Wallet topped up",
    message: `₦${amount.toLocaleString("en-NG")} was added to your wallet.`,
    link: "/wallet",
  });

  return transaction;
}

/** Used internally by other mocks (e.g. checkout) to charge a wallet — not exposed as its own API endpoint. */
export function chargeWalletInternal(userId: string, amount: number, description: string): void {
  const store = loadStore();
  const wallet = getOrInitWallet(store, userId);
  if (wallet.balance < amount) {
    throw { status: 422, message: "Insufficient wallet balance." };
  }
  const transaction: WalletTransaction = {
    id: `WTX-${Date.now().toString(36).toUpperCase()}`,
    type: "payment",
    amount: -amount,
    status: "completed",
    description,
    createdAt: new Date().toISOString(),
  };
  wallet.balance -= amount;
  wallet.transactions = [transaction, ...wallet.transactions];
  saveStore(store);
}
