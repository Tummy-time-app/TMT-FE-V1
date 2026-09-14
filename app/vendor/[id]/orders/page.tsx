import type { Metadata } from "next";
import { Suspense } from "react";
import { VendorStoreShell } from "@/components/vendor-portal/VendorStoreShell";
import { StoreOrders } from "@/components/vendor-portal/StoreOrders";
import "@/app/vendors-listing.css";
import "@/app/orders.css";
import "@/app/vendor-portal.css";

export const metadata: Metadata = {
  title: "Orders — TummyTime",
  description: "Manage incoming orders for your store on TummyTime.",
};

export default async function VendorStoreOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VendorStoreShell storeId={id} active="orders">
      {/* StoreOrders reads ?tab=... via useSearchParams(), same reason
          app/vendors/restaurants/page.tsx wraps RestaurantsList. */}
      <Suspense fallback={null}>
        <StoreOrders storeId={id} />
      </Suspense>
    </VendorStoreShell>
  );
}
