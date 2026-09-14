import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreEarnings } from "@/components/vendor-portal/StoreEarnings";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Earnings — TummyTime",
  description: "Track earnings and settlements for your store on TummyTime.",
};

export default async function VendorStoreEarningsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="earnings">
      <StoreEarnings storeId={id} />
    </VendorStoreShell>
  );
}
