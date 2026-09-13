import type { Metadata } from "next";
import { ShoppingBagIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Personal Shopper — TummyTime",
  description: "Have a TummyTime shopper pick and deliver items for you.",
};

export default function PersonalShopperPage() {
  return (
    <ComingSoonPage
      icon={ShoppingBagIcon}
      title="Personal Shopper"
      message="Have a TummyTime shopper pick and deliver items for you — coming soon."
    />
  );
}
