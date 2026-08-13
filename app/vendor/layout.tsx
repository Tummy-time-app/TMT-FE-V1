"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, ListChecks, Package, Wallet, Tag, Star, Clock, TrendingUp, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";
import { useAuth } from "@/features/auth/hooks";
import { PageSpinner } from "@/components/feedback/PageSpinner";

const VENDOR_NAV_ITEMS = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/vendor/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { href: "/vendor/products", label: "Products", icon: UtensilsCrossed },
  { href: "/vendor/categories", label: "Categories", icon: ListChecks },
  { href: "/vendor/inventory", label: "Inventory", icon: Package },
  { href: "/vendor/promotions", label: "Promotions", icon: Tag },
  { href: "/vendor/reviews", label: "Reviews", icon: Star },
  { href: "/vendor/settings", label: "Store hours", icon: Clock },
  { href: "/vendor/payouts", label: "Payouts", icon: Wallet },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

/** A "vendor"-role account with no store yet gets sent to onboarding instead of the dashboard's dead-end "no vendor linked" state — see app/vendor-onboarding/page.tsx. */
function VendorOnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.vendorId) {
      router.replace("/vendor-onboarding");
    }
  }, [user, router]);

  if (user && !user.vendorId) {
    return <PageSpinner label="Setting things up…" />;
  }

  return <>{children}</>;
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["vendor"]}>
      <VendorOnboardingGate>
        <RoleShell roleLabel="Vendor" navItems={VENDOR_NAV_ITEMS}>
          {children}
        </RoleShell>
      </VendorOnboardingGate>
    </RequireAuth>
  );
}
