"use client";

import { LayoutDashboard, Users, Store, Bike, ClipboardList, Tag, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
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
