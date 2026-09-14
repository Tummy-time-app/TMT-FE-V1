"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useVendorGuard } from "./useVendorGuard";

/**
 * Growing alongside the phased build-out of the vendor portal — add a tab
 * here only once its route actually exists, so this never links to a dead
 * page. Currently covers every section: Overview (index), Orders, Menu,
 * Inventory, Promotions, Reviews, Earnings, Staff, Settings.
 */
export type VendorSection =
  | "overview"
  | "orders"
  | "menu"
  | "inventory"
  | "promotions"
  | "reviews"
  | "earnings"
  | "staff"
  | "settings";

const SECTIONS: { id: VendorSection; label: string; href: (storeId: string) => string }[] = [
  { id: "overview", label: "Overview", href: (id) => `/vendor/${id}` },
  { id: "orders", label: "Orders", href: (id) => `/vendor/${id}/orders` },
  { id: "menu", label: "Menu", href: (id) => `/vendor/${id}/menu` },
  { id: "inventory", label: "Inventory", href: (id) => `/vendor/${id}/inventory` },
  { id: "promotions", label: "Promotions", href: (id) => `/vendor/${id}/promotions` },
  { id: "reviews", label: "Reviews", href: (id) => `/vendor/${id}/reviews` },
  { id: "earnings", label: "Earnings", href: (id) => `/vendor/${id}/earnings` },
  { id: "staff", label: "Staff", href: (id) => `/vendor/${id}/staff` },
  { id: "settings", label: "Settings", href: (id) => `/vendor/${id}/settings` },
];

/**
 * Shared by every /vendor/[id]/* page — owns the vendor guard (loading /
 * "not a vendor" branches, previously duplicated in every section
 * component), the .vd-root wrapper, a "My stores" back-link, and the tab
 * row between sections. `active` is passed explicitly rather than derived
 * from usePathname() — every page already statically knows its own
 * section, so this avoids a pathname-parsing footgun for no benefit.
 *
 * Renders `children` only once ready+vendor — section components (
 * StoreOverview, StoreOrders, StoreSettings, StoreMenu, StoreInventory)
 * no longer need their own copy of this guard.
 */
export function VendorStoreShell({
  storeId,
  active,
  children,
}: {
  storeId: string;
  active: VendorSection;
  children: ReactNode;
}) {
  const { isReady, isSessionLoading, isVendor } = useVendorGuard();

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
      <Link href="/vendor" className="vd-back-link">
        ← My stores
      </Link>

      <nav className="vd-tabs" aria-label="Store sections">
        {SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={section.href(storeId)}
            className={`vd-tab ${active === section.id ? "vd-tab--active" : ""}`}
            aria-current={active === section.id ? "page" : undefined}
          >
            {section.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
