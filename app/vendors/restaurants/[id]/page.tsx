import { Navigation } from "@/components/nav/Navigation";
import { RestaurantView } from "@/components/restaurant/RestaurantView";
import "@/app/vendors-listing.css";
import "@/app/restaurant-detail.css";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <RestaurantView restaurantId={id} />
    </>
  );
}
