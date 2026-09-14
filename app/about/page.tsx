import type { Metadata } from "next";
import { AboutView } from "@/components/marketing/AboutView";

export const metadata: Metadata = {
  title: "About — TummyTime",
  description: "TummyTime connects people with the restaurants, stores, and vendors around them.",
};

export default function AboutPage() {
  return <AboutView />;
}
