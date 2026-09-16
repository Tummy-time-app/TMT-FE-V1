import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { LoyaltyView } from "@/components/rewards/LoyaltyView";
import "@/app/rewards.css";

export const metadata: Metadata = {
  title: "Loyalty Points — TummyTime",
  description: "Collect points on every TummyTime order and redeem them for rewards.",
};

export default function LoyaltyPointsPage() {
  return (
    <>
      <Navigation />
      <LoyaltyView />
    </>
  );
}
