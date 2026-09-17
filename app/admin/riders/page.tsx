import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin-portal/AdminPortalShell";
import { AdminRidersView } from "@/components/admin-portal/AdminRidersView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";
import "@/app/admin-portal.css";

export const metadata: Metadata = {
  title: "Riders — TummyTime Admin",
  description: "Review and approve rider applications.",
};

export default function AdminRidersPage() {
  return (
    <AdminPortalShell active="riders">
      <AdminRidersView />
    </AdminPortalShell>
  );
}
