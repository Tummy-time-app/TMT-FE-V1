import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminShopperRequestsView } from "@/components/admin-portal/AdminShopperRequestsView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Shopper Requests — TummyTime Admin",
  description: "Assign and track Personal Shopper requests.",
};

export default function AdminShopperRequestsPage() {
  return (
    <AdminPortalShell active="shopper-requests">
      <AdminShopperRequestsView />
    </AdminPortalShell>
  );
}
