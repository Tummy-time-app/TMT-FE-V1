import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Set up your account — TummyTime",
  description: "Tell us a bit about you to get started on TummyTime.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
