"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";
import { LogOutIcon, MenuIcon } from "@/components/icons";

/**
 * Replaces the customer-facing <Navigation/> (cart, "Deliver to", food
 * search, Marketplace/Offers browsing) across every /vendor/* page — none
 * of that applies to someone managing a store, and stacking it above
 * VendorStoreShell's sidebar duplicated the site's main nav on top of a
 * dedicated admin shell. This is the vendor portal's own minimal top bar
 * instead: brand mark back to /vendor, the signed-in vendor's name, and
 * an actual logout control (the only one anywhere in the app for a
 * vendor — the customer nav's profile chip was just a link to /vendor,
 * never a logout action; the one real logout() call lives on the
 * customer /profile page, which a vendor account never reaches).
 *
 * `onToggleSidebar` is optional — passed by VendorStoreShell (which owns
 * a store's sidebar and its collapsed state) so this same top bar can
 * also render bare on VendorDashboard's store-list page, which has no
 * sidebar to collapse.
 */
export function VendorTopBar({
  onToggleSidebar,
  sidebarCollapsed,
}: {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/vendor/login");
  };

  return (
    <header className="vd-topbar">
      <div className="vd-topbar__left">
        {onToggleSidebar && (
          <button
            type="button"
            className="vd-topbar__collapse-btn"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            <MenuIcon width={19} height={19} />
          </button>
        )}
        <Link href="/vendor" className="vd-topbar__brand">
          <Image src="/tummytime-logo.png" width={112} height={32} alt="TummyTime" priority />
        </Link>
      </div>
      <div className="vd-topbar__right">
        {user && <span className="vd-topbar__user">{user.name}</span>}
        <button type="button" className="vd-topbar__logout" onClick={handleLogout}>
          <LogOutIcon width={15} height={15} />
          Log out
        </button>
      </div>
    </header>
  );
}
