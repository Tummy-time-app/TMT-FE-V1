import { Navigation } from "@/components/nav/Navigation";
import { MarketDetail } from "@/components/market/MarketDetail";
import "@/app/vendors-listing.css";
import "@/app/shop-detail.css";
import "@/app/restaurant-detail.css";

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <MarketDetail marketId={id} />
    </>
  );
}
