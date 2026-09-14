import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreOverview } from "@/components/vendor-portal/StoreOverview";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Store overview — TummyTime",
  description: "Your store's dashboard on TummyTime.",
};

export default async function VendorStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="overview">
      <StoreOverview storeId={id} />
    </VendorStoreShell>
  );
}
