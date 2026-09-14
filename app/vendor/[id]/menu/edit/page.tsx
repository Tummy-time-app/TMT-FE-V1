import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreMenuEdit } from "@/components/vendor-portal/StoreMenuEdit";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Edit Menu — TummyTime",
  description: "Show or hide menu items from customers on TummyTime.",
};

export default async function VendorStoreMenuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="menu-edit">
      <StoreMenuEdit storeId={id} />
    </VendorStoreShell>
  );
}
