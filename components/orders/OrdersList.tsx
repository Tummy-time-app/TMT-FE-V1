"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useListOrdersQuery } from "@/features/orders/ordersApi";
import { ORDER_STATUS_META } from "@/features/orders/statusMeta";
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function OrdersList() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/orders");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data: orders = [], isLoading, isError } = useListOrdersQuery(
    { customerId: user?.id },
    { skip: !user },
  );
  const { data: restaurants = [] } = useListRestaurantsQuery();

  const restaurantNames = useMemo(() => {
    const map = new Map<string, string>();
    restaurants.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [restaurants]);

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="op-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main className="op-root">
      <header className="op-header">
        <h1 className="op-title">Your Orders</h1>
        <p className="op-subtitle">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading your orders…</p>
      ) : isError ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">⚠️</div>
          <p className="vp-empty-title">Couldn&apos;t load your orders</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">🧾</div>
          <p className="vp-empty-title">No orders yet</p>
          <p className="vp-empty-sub">Once you place an order, it&apos;ll show up here.</p>
          <Link href="/vendors/restaurants" className="vp-empty-cta">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="op-list">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="op-card">
                <div className="op-card__top">
                  <div>
                    <p className="op-card__vendor">
                      {restaurantNames.get(order.restaurantId) ?? "Restaurant"}
                    </p>
                    <p className="op-card__date">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`op-badge op-badge--${meta.tone}`}>{meta.label}</span>
                </div>
                <p className="op-card__items">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {order.items.map((i) => i.name).join(", ")}
                </p>
                <div className="op-card__foot">
                  <span className="op-card__total">{formatNaira(Number(order.totalAmount))}</span>
                  <span className="op-card__arrow">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
