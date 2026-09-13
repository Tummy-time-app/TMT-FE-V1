"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";
import { useListOrdersQuery } from "@/features/orders/ordersApi";
import { useGetNotificationsQuery } from "@/features/notifications/notificationsApi";
import { Navigation } from "@/components/nav/Navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClockIcon } from "@/components/icons";
import "@/app/notifications.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * notificationsApi's GET /api/notifications is a global, unfiltered event
 * log (see its doc comment) — so this view cross-references each entry's
 * orderId against the signed-in user's own orders before showing anything,
 * same guard OrdersList would need if it ever consumed this feed.
 */
export function NotificationsView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/notifications");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data: orders = [] } = useListOrdersQuery({ customerId: user?.id }, { skip: !user });
  const {
    data: allNotifications = [],
    isLoading,
    isError,
  } = useGetNotificationsQuery(undefined, { skip: !user });

  const myOrderIds = useMemo(() => new Set(orders.map((o) => o.id)), [orders]);
  const notifications = useMemo(
    () =>
      allNotifications
        .filter((n) => myOrderIds.has(n.orderId))
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [allNotifications, myOrderIds],
  );

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="nf-root">
        <p className="nf-loading">Loading…</p>
      </main>
    );
  }

  return (
    <>
      <Navigation />
      <main className="nf-root">
        <header className="nf-header">
          <h1 className="nf-title">Notifications</h1>
          <p className="nf-subtitle">
            {notifications.length} update{notifications.length !== 1 ? "s" : ""}
          </p>
        </header>

        {isLoading ? (
          <p className="nf-loading">Loading your notifications…</p>
        ) : isError ? (
          <p className="nf-loading">Couldn&apos;t load notifications right now.</p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title="No notifications yet"
            message="Updates about your orders will show up here."
          />
        ) : (
          <ul className="nf-list">
            {notifications.map((n) => (
              <li key={n.id} className="nf-item">
                <span className="nf-item__dot" aria-hidden />
                <div>
                  <p className="nf-item__message">{n.message}</p>
                  <p className="nf-item__time">{formatDate(n.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
