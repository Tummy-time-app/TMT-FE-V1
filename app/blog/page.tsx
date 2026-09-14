import type { Metadata } from "next";
import { BlogView } from "@/components/marketing/BlogView";

export const metadata: Metadata = {
  title: "Blog — TummyTime",
  description: "Product updates, vendor stories, and what we're building next at TummyTime.",
};

export default function BlogPage() {
  return <BlogView />;
}
