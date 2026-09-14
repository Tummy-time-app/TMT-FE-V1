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
  ChevronDownIcon,
  type IconComponent,
} from "@/components/icons";

/**
 * Growing alongside the phased build-out of the vendor portal — add a tab
 * here only once its route actually exists, so this never links to a dead
 * page. Currently covers every section: Overview (index), Orders, Menu
 * (a primary item with its own All/New/Edit secondary links, WP/Shopify-
 * admin-submenu style), Inventory, Promotions, Reviews, Earnings, Staff,
 * Settings.
 */
export type VendorSection =
  | "overview"
  | "orders"
  | "menu"
  | "menu-new"
  | "menu-edit"
  | "inventory"
  | "promotions"
  | "reviews"
  | "earnings"
  | "staff"
  | "settings";

interface SidebarChild {
  id: VendorSection;
  label: string;
  href: (storeId: string) => string;
}

interface SidebarItem {
  id: VendorSection;
  label: string;
  icon: IconComponent;
  href: (storeId: string) => string;
  /** Secondary links shown under this item, WP/Shopify-admin style — e.g. Menu's All/New/Edit. Only Menu has these today. */
  children?: SidebarChild[];
}

const SECTIONS: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: HomeIcon, href: (id) => `/vendor/${id}` },
  { id: "orders", label: "Orders", icon: ReceiptIcon, href: (id) => `/vendor/${id}/orders` },
  {
    id: "menu",
    label: "Menu",
    icon: UtensilsIcon,
    href: (id) => `/vendor/${id}/menu`,
    children: [
      { id: "menu", label: "All Menus", href: (id) => `/vendor/${id}/menu` },
      { id: "menu-new", label: "New Menu", href: (id) => `/vendor/${id}/menu/new` },
      { id: "menu-edit", label: "Edit Menu", href: (id) => `/vendor/${id}/menu/edit` },
    ],
  },
  { id: "inventory", label: "Inventory", icon: BasketIcon, href: (id) => `/vendor/${id}/inventory` },
  { id: "promotions", label: "Promotions", icon: DiscountIcon, href: (id) => `/vendor/${id}/promotions` },
  { id: "reviews", label: "Reviews", icon: StarIcon, href: (id) => `/vendor/${id}/reviews` },
  { id: "earnings", label: "Earnings", icon: WalletIcon, href: (id) => `/vendor/${id}/earnings` },
  { id: "staff", label: "Staff", icon: UsersIcon, href: (id) => `/vendor/${id}/staff` },
  { id: "settings", label: "Settings", icon: SettingsIcon, href: (id) => `/vendor/${id}/settings` },
];

function findActiveLabel(active: VendorSection): string {
  for (const section of SECTIONS) {
    if (section.id === active) return section.label;
    const child = section.children?.find((c) => c.id === active);
    if (child) return child.label;
  }
  return "Dashboard";
}

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
  // Which primary items' secondary-link lists (currently just Menu) are
  // expanded. Pre-expand whichever one owns the active section — set once
  // from `active` at mount, which is safe here since VendorStoreShell has
  // no shared layout.tsx and remounts fresh on every navigation, so this
  // never goes stale against a changed `active` prop.
  const [expandedGroups, setExpandedGroups] = useState<Set<VendorSection>>(() => {
    const owner = SECTIONS.find((s) => s.children?.some((c) => c.id === active));
    return new Set(owner ? [owner.id] : []);
  });

  const toggleGroup = (id: VendorSection) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <VendorTopBar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="vd-shell">
        <div className="vd-shell__mobile-bar">
          <button type="button" className="vd-shell__menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open store menu">
            <MenuIcon width={20} height={20} />
          </button>
          <span className="vd-shell__mobile-title">{findActiveLabel(active)}</span>
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
            {SECTIONS.map((section) => {
              const isGroupActive = section.children ? section.children.some((c) => c.id === active) : active === section.id;
              const isExpanded = section.children ? expandedGroups.has(section.id) : false;

              return (
                <div key={section.id} className={section.children ? "vd-sidebar__group" : undefined}>
                  {section.children ? (
                    <button
                      type="button"
                      className={`vd-sidebar__link ${isGroupActive ? "vd-sidebar__link--active" : ""}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleGroup(section.id)}
                      title={section.label}
                    >
                      <section.icon width={18} height={18} className="vd-sidebar__icon" aria-hidden />
                      <span className="vd-sidebar__label">{section.label}</span>
                      <ChevronDownIcon
                        width={14}
                        height={14}
                        className={`vd-sidebar__chevron ${isExpanded ? "vd-sidebar__chevron--expanded" : ""}`}
                        aria-hidden
                      />
                    </button>
                  ) : (
                    <Link
                      href={section.href(storeId)}
                      className={`vd-sidebar__link ${isGroupActive ? "vd-sidebar__link--active" : ""}`}
                      aria-current={isGroupActive ? "page" : undefined}
                      onClick={closeMobileNav}
                      title={section.label}
                    >
                      <section.icon width={18} height={18} className="vd-sidebar__icon" aria-hidden />
                      <span className="vd-sidebar__label">{section.label}</span>
                    </Link>
                  )}

                  {section.children && (
                    <div className={`vd-sidebar__subnav ${isExpanded ? "vd-sidebar__subnav--open" : ""}`}>
                      {section.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href(storeId)}
                          className={`vd-sidebar__sublink ${active === child.id ? "vd-sidebar__sublink--active" : ""}`}
                          aria-current={active === child.id ? "page" : undefined}
                          onClick={closeMobileNav}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="vd-content">{children}</main>
      </div>
    </>
  );
}
