import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderDeliveriesList } from "@/components/rider-portal/RiderDeliveriesList";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Deliveries — TummyTime Rider",
  description: "Available delivery requests near you.",
};

export default function RiderDeliveriesPage() {
  return (
    <RiderPortalShell active="deliveries">
      <RiderDeliveriesList />
    </RiderPortalShell>
  );
}
