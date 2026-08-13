"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, Wallet, History, UserCircle, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";
import { useAuth } from "@/features/auth/hooks";
import { PageSpinner } from "@/components/feedback/PageSpinner";
import { useRiderOnline } from "@/hooks/useRiderAvailability";
import { cn } from "@/lib/utils/cn";

const ONBOARDING_PATH = "/rider/profile";

/**
 * A "rider"-role account with no vehicle info yet gets sent straight to
 * /rider/profile instead of a dashboard with nothing to do — mirrors
 * VendorOnboardingGate in app/vendor/layout.tsx. Unlike the vendor case,
 * the onboarding destination is itself a child route under this same
 * layout (there's no separate rider-onboarding page — /rider/profile
 * already collects vehicle type + license), so it must be exempted from
 * the redirect/blocking render or a rider could never reach the form
 * that clears the gate.
 */
function RiderOnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const needsOnboarding = !!user && !user.vehicleType && pathname !== ONBOARDING_PATH;

  useEffect(() => {
    if (needsOnboarding) {
      router.replace(ONBOARDING_PATH);
    }
  }, [needsOnboarding, router]);

  if (needsOnboarding) {
    return <PageSpinner label="Setting things up…" />;
  }

  return <>{children}</>;
}

const RIDER_NAV_ITEMS = [
  { href: "/rider", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/rider/orders", label: "Deliveries", icon: ClipboardList },
  { href: "/rider/earnings", label: "Earnings", icon: Wallet },
  { href: "/rider/history", label: "History", icon: History },
  { href: "/rider/profile", label: "Profile", icon: UserCircle },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

function RiderStatusPill() {
  const online = useRiderOnline();
  return (
    <div className="mb-2 flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-caption font-semibold text-white/80">
      <span className={cn("h-2 w-2 rounded-full", online ? "bg-success" : "bg-white/30")} />
      {online ? "Online" : "Offline"}
    </div>
  );
}

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["rider"]}>
      <RiderOnboardingGate>
        <RoleShell roleLabel="Rider" navItems={RIDER_NAV_ITEMS} sidebarFooter={<RiderStatusPill />}>
          {children}
        </RoleShell>
      </RiderOnboardingGate>
    </RequireAuth>
  );
}
