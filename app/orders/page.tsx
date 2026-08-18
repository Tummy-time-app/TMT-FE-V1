import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { OrdersList } from "@/components/orders/OrdersList";
import "@/app/vendors-listing.css";
import "@/app/orders.css";

export const metadata: Metadata = {
  title: "Your Orders — TummyTime",
  description: "Track and review your TummyTime orders.",
};

export default function OrdersPage() {
  return (
    <>
      <Navigation />
      <OrdersList />
    </>
  );
}
