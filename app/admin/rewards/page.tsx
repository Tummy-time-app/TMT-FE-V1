import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminRewardsView } from "@/components/admin-portal/AdminRewardsView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Rewards — TummyTime Admin",
  description: "Financial impact of the loyalty program.",
};

export default function AdminRewardsPage() {
  return (
    <AdminPortalShell active="rewards">
      <AdminRewardsView />
    </AdminPortalShell>
  );
}
