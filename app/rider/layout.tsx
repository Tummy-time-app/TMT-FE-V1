"use client";

import { LayoutDashboard, ClipboardList, Wallet, History, UserCircle, LifeBuoy } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleShell } from "@/components/layout/RoleShell";
import { useRiderOnline } from "@/hooks/useRiderAvailability";
import { cn } from "@/lib/utils/cn";

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
      <RoleShell roleLabel="Rider" navItems={RIDER_NAV_ITEMS} sidebarFooter={<RiderStatusPill />}>
        {children}
      </RoleShell>
    </RequireAuth>
  );
}
