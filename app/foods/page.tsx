import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { FoodDiscovery } from "@/components/food/FoodDiscovery";
import "@/app/food.css";

export const metadata: Metadata = {
  title: "Food — TummyTime",
  description: "Discover popular dishes, deals, and Nigerian favourites across every restaurant on TummyTime.",
};

export default function FoodsPage() {
  return (
    <>
      <Navigation />
      <FoodDiscovery />
    </>
  );
}
