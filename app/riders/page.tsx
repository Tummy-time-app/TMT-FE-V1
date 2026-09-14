import type { Metadata } from "next";
import { TruckIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Become a Rider — TummyTime",
  description: "Deliver orders and earn with TummyTime.",
};

/** No "rider" role or rider-facing route exists anywhere in TMT-BE-V1 yet — see BusinessView.tsx's doc comment. */
export default function RidersPage() {
  return (
    <ComingSoonPage
      icon={TruckIcon}
      title="Become a Rider"
      message="Rider sign-up isn't open yet — check back soon, or register your store instead from TummyTime for Business."
    />
  );
}
