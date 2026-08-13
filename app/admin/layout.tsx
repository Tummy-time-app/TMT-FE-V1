"use client";

import { LayoutDashboard, Users, Store, Bike, ClipboardList, Tag, Star, Picture, Log, TrendingUp, Wallet, CreditCard, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: Picture },
  { href: "/admin/audit-log", label: "Audit log", icon: Log },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["admin", "super_admin"]}>
      <RoleShell roleLabel="Admin" navItems={ADMIN_NAV_ITEMS}>
        {children}
      </RoleShell>
    </RequireAuth>
  );
}
