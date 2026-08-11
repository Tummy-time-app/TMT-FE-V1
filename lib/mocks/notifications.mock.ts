import { mockDelay } from "@/lib/dev/devMode";
import type { AppNotification, NotificationType } from "@/features/notifications/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * A per-user notification inbox. `pushNotificationInternal` is called
 * directly by other mocks (orders, wallet) at the moment something
 * notification-worthy actually happens — there's no separate "fire an
 * event" system, so notifications only ever exist for real state changes.
 */

const NOTIFICATIONS_STORAGE_KEY = "tummytime_mock_notifications";
const MAX_PER_USER = 50;

type NotificationStore = Record<string, AppNotification[]>;

function loadStore(): NotificationStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? "{}") as NotificationStore;
  } catch {
    return {};
  }
}

function saveStore(store: NotificationStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(store));
}

export function pushNotificationInternal(
  userId: string,
  notification: { type: NotificationType; title: string; message: string; link?: string }
) {
  if (!userId) return;
  const store = loadStore();
  const entry: AppNotification = {
    id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  store[userId] = [entry, ...(store[userId] ?? [])].slice(0, MAX_PER_USER);
  saveStore(store);
}

export async function mockGetNotifications(userId: string): Promise<AppNotification[]> {
  await mockDelay(300);
  const store = loadStore();
  return [...(store[userId] ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockMarkNotificationRead(userId: string, id: string): Promise<AppNotification[]> {
  const store = loadStore();
  store[userId] = (store[userId] ?? []).map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStore(store);
  return store[userId];
}

export async function mockMarkAllNotificationsRead(userId: string): Promise<AppNotification[]> {
  const store = loadStore();
  store[userId] = (store[userId] ?? []).map((n) => ({ ...n, read: true }));
  saveStore(store);
  return store[userId];
}
