import type { Metadata } from "next";
import { CareersView } from "@/components/marketing/CareersView";

export const metadata: Metadata = {
  title: "Careers — TummyTime",
  description: "Help build TummyTime — food, groceries, local shops, and the delivery network that connects them.",
};

export default function CareersPage() {
  return <CareersView />;
}
