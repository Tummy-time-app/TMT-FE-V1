import type { Metadata } from "next";
import { HeartIcon } from "@/components/icons";
import { ComingSoonPage } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Favorites — TummyTime",
  description: "Save your favourite restaurants, shops and dishes on TummyTime.",
};

export default function FavoritesPage() {
  return (
    <ComingSoonPage
      icon={HeartIcon}
      title="Favorites"
      message="Save your favourite restaurants, shops and dishes for quick reorder — coming soon."
    />
  );
}
