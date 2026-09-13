import type { Metadata } from "next";
import { TruckIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Free Deliveries — TummyTime",
  description: "Unlock free delivery perks on TummyTime.",
};

export default function FreeDeliveriesPage() {
  return (
    <ComingSoonPage
      icon={TruckIcon}
      title="Free Deliveries"
      message="Unlock free-delivery perks the more you order — coming soon."
    />
  );
}
