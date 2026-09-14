import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreInventory } from "@/components/vendor-portal/StoreInventory";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Inventory — TummyTime",
  description: "Track stock levels for your store on TummyTime.",
};

export default async function VendorStoreInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="inventory">
      <StoreInventory storeId={id} />
    </VendorStoreShell>
  );
}
