import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreStaff } from "@/components/vendor-portal/StoreStaff";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Staff — TummyTime",
  description: "Manage your store's team on TummyTime.",
};

export default async function VendorStoreStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <VendorStoreShell storeId={id} active="staff">
        <StoreStaff storeId={id} />
      </VendorStoreShell>
    </>
  );
}
