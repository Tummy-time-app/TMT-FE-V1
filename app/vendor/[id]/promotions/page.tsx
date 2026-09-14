import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StorePromotions } from "@/components/vendor-portal/StorePromotions";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Promotions — TummyTime",
  description: "Run deals and discounts for your store on TummyTime.",
};

export default async function VendorStorePromotionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="promotions">
      <StorePromotions storeId={id} />
    </VendorStoreShell>
  );
}
