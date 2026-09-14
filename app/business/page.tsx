import type { Metadata } from "next";
import { BusinessView } from "@/components/marketing/BusinessView";

export const metadata: Metadata = {
  title: "TummyTime for Business — TummyTime",
  description: "Sell on TummyTime or ride for TummyTime — grow your business or earn on your own schedule.",
};

export default function BusinessPage() {
  return <BusinessView />;
}
