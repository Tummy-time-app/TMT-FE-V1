"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useVendorGuard } from "./useVendorGuard";
import { VendorTopBar } from "./VendorTopBar";
import {
  HomeIcon,
  ReceiptIcon,
  UtensilsIcon,
  BasketIcon,
  DiscountIcon,
  StarIcon,
  WalletIcon,
  UsersIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
  ArrowLeftIcon,
  type IconComponent,
} from "@/components/icons";

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

const SECTIONS: { id: VendorSection; label: string; icon: IconComponent; href: (storeId: string) => string }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon, href: (id) => `/vendor/${id}` },
  { id: "orders", label: "Orders", icon: ReceiptIcon, href: (id) => `/vendor/${id}/orders` },
  { id: "menu", label: "Menu", icon: UtensilsIcon, href: (id) => `/vendor/${id}/menu` },
  { id: "inventory", label: "Inventory", icon: BasketIcon, href: (id) => `/vendor/${id}/inventory` },
  { id: "promotions", label: "Promotions", icon: DiscountIcon, href: (id) => `/vendor/${id}/promotions` },
  { id: "reviews", label: "Reviews", icon: StarIcon, href: (id) => `/vendor/${id}/reviews` },
  { id: "earnings", label: "Earnings", icon: WalletIcon, href: (id) => `/vendor/${id}/earnings` },
  { id: "staff", label: "Staff", icon: UsersIcon, href: (id) => `/vendor/${id}/staff` },
  { id: "settings", label: "Settings", icon: SettingsIcon, href: (id) => `/vendor/${id}/settings` },
];

/** Persists the desktop sidebar's minimized/expanded state across page navigations — VendorStoreShell remounts fresh on every route change (no shared layout.tsx), so plain useState alone would reset it every click. */
const SIDEBAR_COLLAPSED_KEY = "tummytime_vendor_sidebar_collapsed";

/**
 * Shared by every /vendor/[id]/* page — an admin-dashboard-style shell
 * (persistent left sidebar + content pane, in the shape of a Shopify/
 * WordPress admin, restyled in TummyTime's own crimson/white brand rather
 * than copying either product's literal color scheme or list-table
 * conventions) replacing the earlier horizontal-tabs shell.
 *
 * Owns the vendor guard (loading / "not a vendor" branches, previously
 * duplicated in every section component), the sidebar's active-link
 * state, and the mobile drawer toggle (same open/backdrop/close pattern
 * as components/nav/Navigation.tsx's mobile drawer, just for this
 * secondary nav instead of the main site one). `active` is passed
 * explicitly rather than derived from usePathname() — every page already
 * statically knows its own section.
 *
 * Renders `children` only once ready+vendor — section components
 * (StoreOverview, StoreOrders, StoreSettings, etc.) don't need their own
 * copy of this guard.
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hydrate from localStorage post-mount (not in the useState initializer)
  // to avoid a server/client hydration mismatch — same pattern as
  // lib/CartContext.tsx / lib/ProfileContext.tsx.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") setSidebarCollapsed(true);
    } catch {
      // unavailable storage — keep the default expanded state
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // unavailable storage — the toggle still works for this render, just won't persist
      }
      return next;
    });
  };

  if (isSessionLoading || !isReady) {
    return (
      <>
        <VendorTopBar />
        <div className="vd-root">
          <p className="vp-empty">Loading…</p>
        </div>
      </>
    );
  }

  if (!isVendor) {
    return (
      <>
        <VendorTopBar />
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
      </>
    );
  }

  const activeSection = SECTIONS.find((s) => s.id === active);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <VendorTopBar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="vd-shell">
        <div className="vd-shell__mobile-bar">
          <button type="button" className="vd-shell__menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open store menu">
            <MenuIcon width={20} height={20} />
          </button>
          <span className="vd-shell__mobile-title">{activeSection?.label ?? "Dashboard"}</span>
        </div>

        <div
          className={`vd-shell__backdrop ${mobileNavOpen ? "vd-shell__backdrop--visible" : ""}`}
          onClick={closeMobileNav}
          aria-hidden
        />

        <aside
          className={`vd-sidebar ${mobileNavOpen ? "vd-sidebar--open" : ""} ${sidebarCollapsed ? "vd-sidebar--collapsed" : ""}`}
          aria-label="Store sections"
        >
          <div className="vd-sidebar__header">
            <Link href="/vendor" className="vd-sidebar__back" onClick={closeMobileNav} title="My stores">
              <ArrowLeftIcon width={13} height={13} />
              <span className="vd-sidebar__back-label">My stores</span>
            </Link>
            <button type="button" className="vd-sidebar__close" onClick={closeMobileNav} aria-label="Close menu">
              <CloseIcon width={13} height={13} />
            </button>
          </div>

          <nav className="vd-sidebar__nav">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href(storeId)}
                className={`vd-sidebar__link ${active === section.id ? "vd-sidebar__link--active" : ""}`}
                aria-current={active === section.id ? "page" : undefined}
                onClick={closeMobileNav}
                title={section.label}
              >
                <section.icon width={18} height={18} className="vd-sidebar__icon" aria-hidden />
                <span className="vd-sidebar__label">{section.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="vd-content">{children}</main>
      </div>
    </>
  );
}
