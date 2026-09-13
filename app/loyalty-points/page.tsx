import type { Metadata } from "next";
import { StarIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Loyalty Points — TummyTime",
  description: "Collect points on every TummyTime order and redeem them for rewards.",
};

export default function LoyaltyPointsPage() {
  return (
    <ComingSoonPage
      icon={StarIcon}
      title="Loyalty Points"
      message="Collect points on every order and redeem them for rewards — coming soon."
    />
  );
}
