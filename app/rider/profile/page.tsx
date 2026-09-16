import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderProfileView } from "@/components/rider-portal/RiderProfileView";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Profile — TummyTime Rider",
  description: "Your rider profile and vehicle details.",
};

export default function RiderProfilePage() {
  return (
    <RiderPortalShell active="profile">
      <RiderProfileView />
    </RiderPortalShell>
  );
}
