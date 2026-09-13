import type { Metadata } from "next";
import { BasketIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Groceries — TummyTime",
  description: "Order groceries and household essentials from nearby stores on TummyTime.",
};

export default function GroceriesPage() {
  return (
    <ComingSoonPage
      icon={BasketIcon}
      title="Groceries"
      message="Order groceries and household essentials from nearby stores — coming soon to TummyTime."
    />
  );
}
