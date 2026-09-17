"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAdminGuard } from "./useAdminGuard";
import { AdminTopBar } from "./AdminTopBar";
import { HomeIcon, ReceiptIcon, StoreIcon, TruckIcon, UsersIcon, WalletIcon, ShoppingBagIcon, MenuIcon, CloseIcon, type IconComponent } from "@/components/icons";

export type AdminSection = "dashboard" | "orders" | "vendors" | "riders" | "customers" | "rewards" | "shopper-requests";

interface SidebarItem {
  id: AdminSection;
  label: string;
  icon: IconComponent;
  href: string;
}

// Flat list — this pass covers 7 of the blueprint's ~15 admin modules (see
// the implementation plan's scope decision). If/when Payments/Promotions/
// Support/etc. get added later, this is the point to borrow
// VendorStoreShell.tsx's `children`-grouped sidebar instead of a flat list.
const SECTIONS: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon, href: "/admin" },
  { id: "orders", label: "Orders", icon: ReceiptIcon, href: "/admin/orders" },
  { id: "vendors", label: "Vendors", icon: StoreIcon, href: "/admin/vendors" },
  { id: "riders", label: "Riders", icon: TruckIcon, href: "/admin/riders" },
  { id: "customers", label: "Customers", icon: UsersIcon, href: "/admin/customers" },
  { id: "rewards", label: "Rewards", icon: WalletIcon, href: "/admin/rewards" },
  { id: "shopper-requests", label: "Shopper Requests", icon: ShoppingBagIcon, href: "/admin/shopper-requests" },
];

const SIDEBAR_COLLAPSED_KEY = "tummytime_admin_sidebar_collapsed";

/**
 * Mirrors components/rider-portal/RiderPortalShell.tsx's shape (no `:id` in
 * the URL — admin isn't scoped to one store or one person). Reuses the same
 * `vd-*`/`vp-*` classes from app/vendor-portal.css/app/vendors-listing.css
 * rather than duplicating that shell CSS.
 */
export function AdminPortalShell({ active, children }: { active: AdminSection; children: ReactNode }) {
  const { isReady, isSessionLoading, isAdmin } = useAdminGuard();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        <AdminTopBar />
        <div className="vd-root">
          <p className="vp-empty">Loading…</p>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <AdminTopBar />
        <div className="vd-root">
          <div className="vp-empty">
            <div className="vp-empty-icon">🔒</div>
            <p className="vp-empty-title">Restricted</p>
            <p className="vp-empty-sub">This area is limited to TummyTime staff accounts.</p>
          </div>
        </div>
      </>
    );
  }

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <AdminTopBar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="vd-shell">
        <div className="vd-shell__mobile-bar">
          <button type="button" className="vd-shell__menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <MenuIcon width={20} height={20} />
          </button>
          <span className="vd-shell__mobile-title">{SECTIONS.find((s) => s.id === active)?.label ?? "Dashboard"}</span>
        </div>

        <div className={`vd-shell__backdrop ${mobileNavOpen ? "vd-shell__backdrop--visible" : ""}`} onClick={closeMobileNav} aria-hidden />

        <aside className={`vd-sidebar ${mobileNavOpen ? "vd-sidebar--open" : ""} ${sidebarCollapsed ? "vd-sidebar--collapsed" : ""}`} aria-label="Admin sections">
          <div className="vd-sidebar__header">
            <span className="vd-sidebar__back-label" style={{ fontWeight: 700 }}>
              Admin
            </span>
            <button type="button" className="vd-sidebar__close" onClick={closeMobileNav} aria-label="Close menu">
              <CloseIcon width={13} height={13} />
            </button>
          </div>

          <nav className="vd-sidebar__nav">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
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
