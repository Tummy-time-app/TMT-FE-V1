"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRiderGuard } from "./useRiderGuard";
import { RiderTopBar } from "./RiderTopBar";
import { HomeIcon, TruckIcon, WalletIcon, ClockIcon, SettingsIcon, MenuIcon, CloseIcon, type IconComponent } from "@/components/icons";

export type RiderSection = "dashboard" | "deliveries" | "earnings" | "history" | "profile";

interface SidebarItem {
  id: RiderSection;
  label: string;
  icon: IconComponent;
  href: string;
}

const SECTIONS: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon, href: "/rider" },
  { id: "deliveries", label: "Deliveries", icon: TruckIcon, href: "/rider/deliveries" },
  { id: "earnings", label: "Earnings", icon: WalletIcon, href: "/rider/earnings" },
  { id: "history", label: "History", icon: ClockIcon, href: "/rider/history" },
  { id: "profile", label: "Profile", icon: SettingsIcon, href: "/rider/profile" },
];

/** Persists the desktop sidebar's minimized/expanded state — same pattern as VendorStoreShell's, its own separate key. */
const SIDEBAR_COLLAPSED_KEY = "tummytime_rider_sidebar_collapsed";

/**
 * Mirrors components/vendor-portal/VendorStoreShell.tsx (sidebar + mobile
 * drawer + collapsed-state persistence), simplified since a rider isn't
 * scoped to a store (no :id param, no secondary-link groups). Reuses the
 * `vd-*` classes from app/vendor-portal.css rather than duplicating that
 * shell CSS — see app/rider-portal.css for what's genuinely rider-specific.
 *
 * Gates on role/auth (useRiderGuard) AND verification status — unlike
 * vendors, a rider account can exist but still be "pending" review (no
 * Admin dashboard exists yet to approve one; see the rider-app
 * implementation plan). Renders a dedicated pending/rejected state instead
 * of `children` until verified.
 */
export function RiderPortalShell({ active, children }: { active: RiderSection; children: ReactNode }) {
  const { isReady, isSessionLoading, isRider, riderProfile, isLoadingProfile } = useRiderGuard();
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

  if (isSessionLoading || !isReady || (isRider && isLoadingProfile)) {
    return (
      <>
        <RiderTopBar />
        <div className="vd-root">
          <p className="vp-empty">Loading…</p>
        </div>
      </>
    );
  }

  if (!isRider) {
    return (
      <>
        <RiderTopBar />
        <div className="vd-root">
          <div className="vp-empty">
            <div className="vp-empty-icon">🛵</div>
            <p className="vp-empty-title">This isn&apos;t a rider account</p>
            <p className="vp-empty-sub">Sign up to start delivering with TummyTime.</p>
            <Link href="/rider/signup" className="vp-empty-cta">
              Become a rider
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (riderProfile && riderProfile.verificationStatus !== "verified") {
    return (
      <>
        <RiderTopBar />
        <div className="vd-root">
          <div className="vp-empty">
            <div className="vp-empty-icon">{riderProfile.verificationStatus === "rejected" ? "🚫" : "⏳"}</div>
            <p className="vp-empty-title">
              {riderProfile.verificationStatus === "rejected" ? "Application not approved" : "Verification pending"}
            </p>
            <p className="vp-empty-sub">
              {riderProfile.verificationStatus === "rejected"
                ? "Your rider application wasn't approved. Contact support for details."
                : "We're reviewing your rider application. You'll be able to go online once it's approved."}
            </p>
          </div>
        </div>
      </>
    );
  }

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <RiderTopBar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="vd-shell">
        <div className="vd-shell__mobile-bar">
          <button type="button" className="vd-shell__menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <MenuIcon width={20} height={20} />
          </button>
          <span className="vd-shell__mobile-title">{SECTIONS.find((s) => s.id === active)?.label ?? "Dashboard"}</span>
        </div>

        <div className={`vd-shell__backdrop ${mobileNavOpen ? "vd-shell__backdrop--visible" : ""}`} onClick={closeMobileNav} aria-hidden />

        <aside className={`vd-sidebar ${mobileNavOpen ? "vd-sidebar--open" : ""} ${sidebarCollapsed ? "vd-sidebar--collapsed" : ""}`} aria-label="Rider sections">
          <div className="vd-sidebar__header">
            <span className="vd-sidebar__back-label" style={{ fontWeight: 700 }}>
              Rider App
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
