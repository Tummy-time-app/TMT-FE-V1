"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useVendorGuard } from "./useVendorGuard";
import { useGetMyStoresQuery, useToggleStoreOpenMutation } from "@/features/vendor/vendorApi";

export function VendorDashboard() {
  const router = useRouter();
  const { user, isReady, isSessionLoading, isVendor } = useVendorGuard();
  const { data: stores = [], isLoading } = useGetMyStoresQuery(user?.id ?? "", { skip: !isReady || !isVendor });
  const [toggleOpen] = useToggleStoreOpenMutation();

  // A brand-new vendor account has no store yet — send them straight into
  // the full setup wizard instead of landing on a mostly-empty dashboard
  // (see VendorOnboardingFlow's doc comment for what that collects). The
  // common case from here on is exactly one store (one per vendor is now
  // enforced at signup — see VendorOnboardingFlow's redirect guard), so
  // skip the "list of one" and go straight to that store's own dashboard.
  // The list below only ever renders for the >1 edge case: an account
  // that already had multiple stores from before that restriction existed.
  useEffect(() => {
    if (!isReady || !isVendor || isLoading) return;
    if (stores.length === 0) router.replace("/vendor/onboarding");
    else if (stores.length === 1) router.replace(`/vendor/${stores[0].id}`);
  }, [isReady, isVendor, isLoading, stores, router]);

  if (isSessionLoading || !isReady) {
    return (
      <div className="vd-root">
        <p className="vp-empty">Loading…</p>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="vd-root">
        <div className="vp-empty">
          <div className="vp-empty-icon">🏪</div>
          <p className="vp-empty-title">This isn&apos;t a vendor account</p>
          <p className="vp-empty-sub">Register a restaurant account to manage a store on TummyTime.</p>
          <Link href="/vendor/signup" className="vp-empty-cta">
            Register your restaurant
          </Link>
        </div>
      </div>
    );
  }

  // Same conditions as the redirect effect above — render a placeholder
  // for that one frame rather than flashing content before the
  // navigation (to onboarding, or straight to the one store) lands.
  if (!isLoading && stores.length <= 1) {
    return (
      <div className="vd-root">
        <p className="vp-empty">{stores.length === 0 ? "Setting things up…" : "Loading your store…"}</p>
      </div>
    );
  }

  // Reachable only for the >1 edge case described above.
  return (
    <div className="vd-root">
      <header className="vd-header">
        <h1 className="vd-title">Your Stores</h1>
        <p className="vd-subtitle">{stores.length} stores</p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading your stores…</p>
      ) : (
        <div className="vd-store-list">
          {stores.map((store) => (
            <div key={store.id} className="vd-store-card">
              <Link href={`/vendor/${store.id}`} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
                <p className="vd-store-card__name">{store.name}</p>
                <p className="vd-store-card__meta">
                  {store.address} · {store.storeStatus === "OPEN" ? "Open" : store.storeStatus === "TEMPORARILY_CLOSED" ? "Temporarily closed" : "Closed"}
                </p>
              </Link>
              <div className="vd-store-card__right">
                <button
                  type="button"
                  className={`vd-switch ${store.isOpen ? "vd-switch--on" : ""}`}
                  aria-label={store.isOpen ? "Close store" : "Open store"}
                  aria-pressed={store.isOpen}
                  onClick={() => toggleOpen(store.id)}
                >
                  <span className="vd-switch__thumb" />
                </button>
                <Link href={`/vendor/${store.id}`} style={{ color: "#bbb", textDecoration: "none" }}>
                  →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
