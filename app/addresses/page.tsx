import type { Metadata } from "next";
import { MapPinIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Addresses — TummyTime",
  description: "Save multiple delivery addresses for faster checkout on TummyTime.",
};

export default function AddressesPage() {
  return (
    <ComingSoonPage
      icon={MapPinIcon}
      title="Addresses"
      message={
        'Save multiple delivery addresses for faster checkout — coming soon. For now, set your delivery address from the "Deliver to" button in the nav bar.'
      }
    />
  );
}
