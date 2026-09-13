import type { Metadata } from "next";
import { ReceiptIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Wallet — TummyTime",
  description: "Fund your TummyTime wallet and pay for orders in one tap.",
};

export default function WalletPage() {
  return (
    <ComingSoonPage
      icon={ReceiptIcon}
      title="Wallet"
      message="Fund your TummyTime wallet and pay for orders in one tap — coming soon."
    />
  );
}
