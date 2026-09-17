import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminVendorsView } from "@/components/admin-portal/AdminVendorsView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Vendors — TummyTime Admin",
  description: "Approve, reject, or remove vendors.",
};

export default function AdminVendorsPage() {
  return (
    <AdminPortalShell active="vendors">
      <AdminVendorsView />
    </AdminPortalShell>
  );
}
