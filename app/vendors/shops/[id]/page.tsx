import { Navigation } from "@/components/nav/Navigation";
import { ShopDetail } from "@/components/shop/ShopDetail";
import "@/app/vendors-listing.css";
import "@/app/shop-detail.css";

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <ShopDetail shopId={id} />
    </>
  );
}
