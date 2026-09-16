import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { FreeDeliveryView } from "@/components/rewards/FreeDeliveryView";
import "@/app/rewards.css";

export const metadata: Metadata = {
  title: "Free Deliveries — TummyTime",
  description: "Unlock free delivery perks on TummyTime.",
};

export default function FreeDeliveriesPage() {
  return (
    <>
      <Navigation />
      <FreeDeliveryView />
    </>
  );
}
