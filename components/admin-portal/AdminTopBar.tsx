"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";
import { LogOutIcon, MenuIcon } from "@/components/icons";

/** Mirrors components/rider-portal/RiderTopBar.tsx — same minimal-admin-shell top bar, pointed at /admin instead of /rider. */
export function AdminTopBar({
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
    router.push("/admin/login");
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
        <Link href="/admin" className="vd-topbar__brand">
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
