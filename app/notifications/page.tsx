"use client";

import { Bell } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { AppNotification } from "@/features/notifications/types";

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function NotificationsContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: notifications, isLoading, error, refetch } = useGetNotificationsQuery(userId, { skip: !userId });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const today = notifications?.filter((n) => isToday(n.createdAt)) ?? [];
  const earlier = notifications?.filter((n) => !isToday(n.createdAt)) ?? [];

  const handleClick = (n: AppNotification) => {
    if (!n.read) markRead({ userId, id: n.id });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Notifications</h1>
          <p className="mt-1 text-small text-text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(userId)}
            className="text-small font-semibold text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="Order and account updates will show up here." />
        ) : (
          <div className="space-y-6">
            {today.length > 0 && (
              <section>
                <h2 className="mb-2 text-caption font-bold uppercase tracking-wide text-text-subtle">Today</h2>
                <div className="space-y-1 rounded-lg border border-border bg-surface p-1.5">
                  {today.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
                  ))}
                </div>
              </section>
            )}
            {earlier.length > 0 && (
              <section>
                <h2 className="mb-2 text-caption font-bold uppercase tracking-wide text-text-subtle">Earlier</h2>
                <div className="space-y-1 rounded-lg border border-border bg-surface p-1.5">
                  {earlier.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
