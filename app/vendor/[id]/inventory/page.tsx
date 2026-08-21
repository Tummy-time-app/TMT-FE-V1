import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
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
    <>
      <Navigation />
      <StoreInventory storeId={id} />
    </>
  );
}
