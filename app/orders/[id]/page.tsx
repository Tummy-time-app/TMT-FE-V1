import { Navigation } from "@/components/nav/Navigation";
import { OrderDetail } from "@/components/orders/OrderDetail";
import "@/app/vendors-listing.css";
import "@/app/orders.css";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navigation />
      <OrderDetail orderId={id} />
    </>
  );
}
