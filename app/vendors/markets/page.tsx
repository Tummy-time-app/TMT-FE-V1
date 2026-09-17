import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { MarketsIndex } from "@/components/vendor/MarketsIndex";
import "@/app/vendors-listing.css";

export const metadata: Metadata = {
  title: "Markets — TummyTime",
  description: "Browse local markets and their vendors near you on TummyTime.",
};

export default function MarketsPage() {
  return (
    <>
      <Navigation />
      <MarketsIndex />
    </>
  );
}
