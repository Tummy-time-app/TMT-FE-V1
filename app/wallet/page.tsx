import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { WalletView } from "@/components/rewards/WalletView";
import "@/app/rewards.css";

export const metadata: Metadata = {
  title: "Wallet — TummyTime",
  description: "Fund your TummyTime wallet and pay for orders in one tap.",
};

export default function WalletPage() {
  return (
    <>
      <Navigation />
      <WalletView />
    </>
  );
}
