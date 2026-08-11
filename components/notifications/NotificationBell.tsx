"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import { NotificationItem } from "./NotificationItem";
import { cn } from "@/lib/utils/cn";

const POLL_INTERVAL_MS = 15000;
const DROPDOWN_LIMIT = 8;

interface NotificationBellProps {
  /** Icon/text color for the bell button itself — defaults suit a light navbar; pass "light" for a dark sidebar. */
  variant?: "dark" | "light";
}

export function NotificationBell({ variant = "dark" }: NotificationBellProps) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications } = useGetNotificationsQuery(user?.id ?? "", {
    skip: !isAuthenticated,
    pollingInterval: POLL_INTERVAL_MS,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated || !user) return null;

  const handleItemClick = (id: string, read: boolean) => {
    if (!read) markRead({ userId: user.id, id });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          variant === "dark" ? "text-text hover:bg-black/5" : "text-white/85 hover:bg-white/10"
        )}
      >
        <Bell size={18} aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[300] mt-2 w-80 max-w-[90vw] overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-small font-bold text-text">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(user.id)}
                className="text-caption font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-1.5">
            {!notifications || notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-small text-text-muted">You&apos;re all caught up.</p>
            ) : (
              notifications
                .slice(0, DROPDOWN_LIMIT)
                .map((n) => <NotificationItem key={n.id} notification={n} onClick={() => handleItemClick(n.id, n.read)} />)
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-3 py-2.5 text-center text-small font-semibold text-primary hover:bg-primary/5"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
