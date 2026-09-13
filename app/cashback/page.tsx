import type { Metadata } from "next";
import { DiscountIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Cashback — TummyTime",
  description: "Earn cashback on your TummyTime orders.",
};

export default function CashbackPage() {
  return (
    <ComingSoonPage
      icon={DiscountIcon}
      title="Cashback"
      message="Earn cashback on your orders and use it toward future purchases — coming soon."
    />
  );
}
