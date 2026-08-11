"use client";

import { LayoutDashboard, ClipboardList, UtensilsCrossed, Wallet, Tag, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";

const VENDOR_NAV_ITEMS = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { href: "/vendor/products", label: "Products", icon: UtensilsCrossed },
  { href: "/vendor/promotions", label: "Promotions", icon: Tag },
  { href: "/vendor/payouts", label: "Payouts", icon: Wallet },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["vendor"]}>
      <RoleShell roleLabel="Vendor" navItems={VENDOR_NAV_ITEMS}>
        {children}
      </RoleShell>
    </RequireAuth>
  );
}
