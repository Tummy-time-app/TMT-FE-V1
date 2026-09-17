import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminDashboard } from "@/components/admin-portal/AdminDashboard";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Admin Dashboard — TummyTime",
  description: "Platform overview.",
};

export default function AdminDashboardPage() {
  return (
    <AdminPortalShell active="dashboard">
      <AdminDashboard />
    </AdminPortalShell>
  );
}
