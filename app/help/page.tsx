import type { Metadata } from "next";
import { HelpCentreView } from "@/components/help/HelpCentreView";

export const metadata: Metadata = {
  title: "Help Centre — TummyTime",
  description: "Answers to common questions about ordering on TummyTime.",
};

export default function HelpPage() {
  return <HelpCentreView />;
}
