import { Navigation } from "@/components/nav/Navigation";
import { StoreSettings } from "@/components/vendor-portal/StoreSettings";
import "@/app/vendors-listing.css";
import "@/app/vendor-portal.css";

export default async function VendorStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <StoreSettings storeId={id} />
    </>
  );
}
