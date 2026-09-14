import type { Metadata } from "next";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreReviews } from "@/components/vendor-portal/StoreReviews";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Reviews — TummyTime",
  description: "See and respond to customer reviews on TummyTime.",
};

export default async function VendorStoreReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="reviews">
      <StoreReviews storeId={id} />
    </VendorStoreShell>
  );
}
