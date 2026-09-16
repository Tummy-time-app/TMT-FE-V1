"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderProfileQuery, useSetRiderOnlineStatusMutation } from "@/features/rider/riderProfileApi";
import { useGetRiderEarningsSummaryQuery } from "@/features/rider/riderEarningsApi";
import { useGetAvailableDeliveriesQuery } from "@/features/rider/riderOrdersApi";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Rendered inside RiderPortalShell, which already guarantees a verified, signed-in rider before mounting this. */
export function RiderDashboard() {
  const { user } = useAuth();
  const { data: profile } = useGetRiderProfileQuery(user?.id ?? "", { skip: !user });
  const [setOnlineStatus, { isLoading: isToggling }] = useSetRiderOnlineStatusMutation();
  const { data: summary } = useGetRiderEarningsSummaryQuery(user?.id ?? "", { skip: !user });
  const { data: available = [] } = useGetAvailableDeliveriesQuery(undefined, { skip: !profile?.isOnline });

  const handleToggle = () => {
    if (!user || !profile) return;
    setOnlineStatus({ userId: user.id, isOnline: !profile.isOnline });
  };

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Dashboard</h1>
        <p className="vd-subtitle">Go online to start receiving delivery requests.</p>
      </header>

      <div className="rd-toggle-row">
        <div>
          <p className="rd-toggle-row__label">{profile?.isOnline ? "You're online" : "You're offline"}</p>
          <p className="rd-toggle-row__sub">{profile?.isOnline ? "Available deliveries will show up below." : "Go online to see delivery requests."}</p>
        </div>
        <button
          type="button"
          className={`rd-switch ${profile?.isOnline ? "rd-switch--on" : ""}`}
          onClick={handleToggle}
          disabled={isToggling}
          role="switch"
          aria-checked={!!profile?.isOnline}
          aria-label="Toggle online status"
        >
          <span className="rd-switch__knob" />
        </button>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Today</h2>
        <div className="vd-metrics-grid">
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{formatNaira(summary?.totalEarnings ?? 0)}</p>
            <p className="vd-metric-card__label">Total earnings</p>
          </div>
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{summary?.completedDeliveries ?? 0}</p>
            <p className="vd-metric-card__label">Completed deliveries</p>
          </div>
          <div className="vd-metric-card">
            <p className="vd-metric-card__value">{profile?.rating?.toFixed(1) ?? "—"}</p>
            <p className="vd-metric-card__label">Rating</p>
          </div>
        </div>
        <p className="vd-subtitle" style={{ marginTop: 10 }}>
          Total earnings is a real aggregate of your completed deliveries — there&apos;s no separate today/week/month breakdown yet.
        </p>
      </div>

      {profile?.isOnline && (
        <div className="vd-section">
          <h2 className="vd-section-title">Available deliveries</h2>
          {available.length === 0 ? (
            <p className="vp-empty">No delivery requests right now — check back soon.</p>
          ) : (
            <p className="vd-subtitle">
              {available.length} deliver{available.length !== 1 ? "ies" : "y"} waiting.{" "}
              <Link href="/rider/deliveries" style={{ color: "var(--crimson)", fontWeight: 700 }}>
                View all
              </Link>
            </p>
          )}
        </div>
      )}
    </>
  );
}
