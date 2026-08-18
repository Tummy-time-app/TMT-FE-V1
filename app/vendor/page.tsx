import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { VendorDashboard } from "@/components/vendor-portal/VendorDashboard";
import "@/app/vendors-listing.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Vendor Dashboard — TummyTime",
  description: "Manage your TummyTime store.",
};

export default function VendorPage() {
  return (
    <>
      <Navigation />
      <VendorDashboard />
    </>
  );
}
