import type { Metadata } from "next";
import { ContactView } from "@/components/marketing/ContactView";

export const metadata: Metadata = {
  title: "Contact — TummyTime",
  description: "Get in touch with TummyTime.",
};

export default function ContactPage() {
  return <ContactView />;
}
