import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreMenuNew } from "@/components/vendor-portal/StoreMenuNew";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "New Menu — TummyTime",
  description: "Add categories and menu items on TummyTime.",
};

export default async function VendorStoreMenuNewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="menu-new">
      <StoreMenuNew storeId={id} />
    </VendorStoreShell>
  );
}
