import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminOrdersView } from "@/components/admin-portal/AdminOrdersView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Orders — TummyTime Admin",
  description: "Monitor every order platform-wide.",
};

export default function AdminOrdersPage() {
  return (
    <AdminPortalShell active="orders">
      <AdminOrdersView />
    </AdminPortalShell>
  );
}
