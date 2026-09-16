import type { Metadata } from "next";
import { RiderPortalShell } from "@/components/rider-portal/RiderPortalShell";
import { RiderDeliveryDetail } from "@/components/rider-portal/RiderDeliveryDetail";
import "@/app/vendor-portal.css";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/rider-portal.css";

export const metadata: Metadata = {
  title: "Delivery — TummyTime Rider",
  description: "Manage your active delivery.",
};

export default async function RiderDeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RiderPortalShell active="deliveries">
      <RiderDeliveryDetail orderId={id} />
    </RiderPortalShell>
  );
}
