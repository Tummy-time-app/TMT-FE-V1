import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminCustomersView } from "@/components/admin-portal/AdminCustomersView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Customers — TummyTime Admin",
  description: "Every platform account.",
};

export default function AdminCustomersPage() {
  return (
    <AdminPortalShell active="customers">
      <AdminCustomersView />
    </AdminPortalShell>
  );
}
