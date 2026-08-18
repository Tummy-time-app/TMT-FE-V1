"use client";

import Link from "next/link";
import { useVendorGuard } from "./useVendorGuard";
import { useGetMyStoresQuery, useToggleStoreOpenMutation } from "@/features/vendor/vendorApi";
import { CreateStoreForm } from "./CreateStoreForm";

export function VendorDashboard() {
  const { user, isReady, isSessionLoading, isVendor } = useVendorGuard();
  const { data: stores = [], isLoading } = useGetMyStoresQuery(user?.id ?? "", { skip: !isReady || !isVendor });
  const [toggleOpen] = useToggleStoreOpenMutation();

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

  return (
    <div className="vd-root">
      <header className="vd-header">
        <h1 className="vd-title">Your Stores</h1>
        <p className="vd-subtitle">
          {stores.length} store{stores.length !== 1 ? "s" : ""}
        </p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading your stores…</p>
      ) : stores.length > 0 ? (
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
      ) : null}

      <CreateStoreForm ownerId={user!.id} />
    </div>
  );
}
