"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X, type IconComponent } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useToast } from "@/components/feedback/ToastProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils/cn";

export interface RoleNavItem {
  href: string;
  label: string;
  icon: IconComponent;
  exact?: boolean;
}

interface RoleShellProps {
  roleLabel: string;
  navItems: RoleNavItem[];
  /** Optional content rendered above the logout button (e.g. a live status pill). */
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

/** Shared sidebar+topbar shell for role-gated app areas (vendor, rider, admin…). Sidebar on desktop, drawer on mobile. */
export function RoleShell({ roleLabel, navItems, sidebarFooter, children }: RoleShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out.");
    router.push("/login");
  };

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-small font-semibold transition-colors",
            isActive(href, exact) ? "bg-primary text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <Icon size={17} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      {sidebarFooter}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-small font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut size={17} aria-hidden />
        Log out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-primary-dark md:flex">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
          <span className="font-display text-h3 font-bold text-white">TummyTime</span>
          <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {roleLabel}
          </span>
        </div>
        {navLinks}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-primary-dark shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <span className="font-display text-h3 font-bold text-white">TummyTime</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-white">
                <X size={20} />
              </button>
            </div>
            {navLinks}
            {footer}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-text md:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-small font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-small font-semibold text-text">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
