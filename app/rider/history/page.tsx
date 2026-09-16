import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderHistory } from "@/components/rider-portal/RiderHistory";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Delivery History — TummyTime Rider",
  description: "Your completed deliveries.",
};

export default function RiderHistoryPage() {
  return (
    <RiderPortalShell active="history">
      <RiderHistory />
    </RiderPortalShell>
  );
}
