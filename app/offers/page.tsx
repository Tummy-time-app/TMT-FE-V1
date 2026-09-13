import type { Metadata } from "next";
import { OffersView } from "@/components/offers/OffersView";

export const metadata: Metadata = {
  title: "Deals & Discounts — TummyTime",
  description: "₦1,000 off, free delivery, 10% off, first-order offers and loyalty rewards on TummyTime.",
};

export default function OffersPage() {
  return <OffersView />;
}
