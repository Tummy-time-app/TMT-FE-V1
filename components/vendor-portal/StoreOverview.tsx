"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";
import { useGetMyStoresQuery } from "@/features/vendor/vendorApi";
import { useGetVendorDashboardQuery } from "@/features/vendor/vendorOrdersApi";
import { ORDER_STATUS_META } from "@/features/orders/statusMeta";
import { Skeleton } from "@/components/ui/Skeleton";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Matches .vd-metric-card's shape (value bar + label bar, centered) while the dashboard query is in flight. */
function MetricCardSkeleton() {
  return (
    <div className="vd-metric-card">
      <Skeleton style={{ width: 48, height: 22, margin: "0 auto 6px" }} />
      <Skeleton style={{ width: 60, height: 11, margin: "0 auto" }} />
    </div>
  );
}

/** Whole-page skeleton — shown for both stages of loading (the store record itself, then the dashboard metrics), so the layout never collapses to a bare loading line. */
function OverviewSkeleton() {
  return (
    <>
      <header className="vd-header">
        <Skeleton style={{ width: 200, height: 26, marginBottom: 8 }} />
        <Skeleton style={{ width: 130, height: 13 }} />
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Today</h2>
        <div className="vd-metrics-grid">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Action required</h2>
        <div className="vd-form-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton style={{ width: 110, height: 13 }} />
              <Skeleton style={{ width: 24, height: 13 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Recent orders</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="op-item-row">
              <div>
                <Skeleton style={{ width: 140, height: 13, marginBottom: 6 }} />
                <Skeleton style={{ width: 90, height: 11 }} />
              </div>
              <Skeleton style={{ width: 70, height: 22, borderRadius: 999 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreOverview({ storeId }: { storeId: string }) {
  const { user } = useAuth();
  const { data: stores = [] } = useGetMyStoresQuery(user?.id ?? "", { skip: !user });
  const store = stores.find((s) => s.id === storeId);
  const { data: metrics, isLoading, isError } = useGetVendorDashboardQuery(storeId);

  // One combined loading state — store lookup and dashboard metrics load
  // in parallel, so a single skeleton covers both instead of two
  // sequential "Loading…" text states collapsing the page layout.
  if (!store || isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">{store.name}</h1>
        <p className="vd-subtitle">{store.storeStatus === "OPEN" ? "Open for orders" : "Not accepting orders"}</p>
      </header>

      {isError || !metrics ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load your dashboard</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : (
        <>
          <div className="vd-section">
            <h2 className="vd-section-title">Today</h2>
            <div className="vd-metrics-grid">
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{metrics.todayMetrics.totalOrders}</p>
                <p className="vd-metric-card__label">Orders</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{formatNaira(metrics.todayMetrics.totalRevenue)}</p>
                <p className="vd-metric-card__label">Revenue</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{metrics.todayMetrics.pendingCount}</p>
                <p className="vd-metric-card__label">Pending</p>
              </div>
              <div className="vd-metric-card">
                <p className="vd-metric-card__value">{metrics.todayMetrics.completedCount}</p>
                <p className="vd-metric-card__label">Completed</p>
              </div>
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Action required</h2>
            <div className="vd-form-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href={`/vendor/${storeId}/orders?tab=new`}
                style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
              >
                <span>New orders</span>
                <strong style={{ color: "var(--crimson)" }}>{metrics.actionRequired.newOrdersCount}</strong>
              </Link>
              <Link
                href={`/vendor/${storeId}/inventory`}
                style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
              >
                <span>Low stock alerts</span>
                <strong>{metrics.actionRequired.lowStockAlertsCount}</strong>
              </Link>
              {/* Not a link — no messaging feature exists in this app yet to send it to. */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Customer messages</span>
                <strong>{metrics.actionRequired.customerMessagesCount}</strong>
              </div>
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Recent orders</h2>
            {metrics.recentOrders.length === 0 ? (
              <p className="vp-empty">No orders yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {metrics.recentOrders.map((order) => {
                  const meta = ORDER_STATUS_META[order.status];
                  return (
                    <div key={order.id} className="op-item-row">
                      <div>
                        <p className="op-item-row__name">Order #{order.id.slice(0, 8)}</p>
                        <p className="op-item-row__qty">{formatTime(order.createdAt)}</p>
                      </div>
                      <span className={`op-badge op-badge--${meta.tone}`}>{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href={`/vendor/${storeId}/orders`} className="vd-back-link" style={{ marginTop: 12, marginBottom: 0 }}>
              View all orders →
            </Link>
          </div>
        </>
      )}
    </>
  );
}
