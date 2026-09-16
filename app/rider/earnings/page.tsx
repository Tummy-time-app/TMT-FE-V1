import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderEarnings } from "@/components/rider-portal/RiderEarnings";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Earnings — TummyTime Rider",
  description: "Track what you've earned from deliveries.",
};

export default function RiderEarningsPage() {
  return (
    <RiderPortalShell active="earnings">
      <RiderEarnings />
    </RiderPortalShell>
  );
}
