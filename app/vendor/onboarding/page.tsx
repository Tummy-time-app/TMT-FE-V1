import type { Metadata } from "next";
import { VendorOnboardingFlow } from "@/components/vendor-portal/onboarding/VendorOnboardingFlow";

export const metadata: Metadata = {
  title: "Set up your store — TummyTime",
  description: "Tell us about your business to start selling on TummyTime.",
};

export default function VendorOnboardingPage() {
  return <VendorOnboardingFlow />;
}
