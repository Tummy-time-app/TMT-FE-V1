import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { StoreMenu } from "@/components/vendor-portal/StoreMenu";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Manage Menu — TummyTime",
  description: "Manage your store's menu on TummyTime.",
};

export default async function VendorStoreMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <StoreMenu storeId={id} />
    </>
  );
}
