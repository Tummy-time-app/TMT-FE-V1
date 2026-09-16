import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { CashbackView } from "@/components/rewards/CashbackView";
import "@/app/rewards.css";

export const metadata: Metadata = {
  title: "Cashback — TummyTime",
  description: "Earn cashback on your TummyTime orders.",
};

export default function CashbackPage() {
  return (
    <>
      <Navigation />
      <CashbackView />
    </>
  );
}
