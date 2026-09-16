import { redirect } from "next/navigation";

/**
 * Was a ComingSoonPage holding page while no rider role/route existed
 * anywhere in TMT-BE-V1. Now that the Rider app is real (see
 * components/rider-portal/), this just forwards to the actual signup flow
 * rather than maintaining a second, near-duplicate marketing surface
 * alongside components/marketing/BusinessView.tsx's rider panel.
 */
export default function RidersPage() {
  redirect("/rider/signup");
}
