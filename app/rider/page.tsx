import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderDashboard } from "@/components/rider-portal/RiderDashboard";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Rider Dashboard — TummyTime",
  description: "Go online and manage your TummyTime deliveries.",
};

export default function RiderDashboardPage() {
  return (
    <RiderPortalShell active="dashboard">
      <RiderDashboard />
    </RiderPortalShell>
  );
}
