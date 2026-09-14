import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreSettings } from "@/components/vendor-portal/StoreSettings";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Store settings — TummyTime",
  description: "Manage your store's profile and status on TummyTime.",
};

export default async function VendorStoreSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <VendorStoreShell storeId={id} active="settings">
        <StoreSettings storeId={id} />
      </VendorStoreShell>
    </>
  );
}
