import type { Metadata } from "next";
import { Navigation } from "@/components/nav/Navigation";
import { CartView } from "@/components/cart/CartView";
import "@/app/cart.css";

export const metadata: Metadata = {
  title: "Your Cart — TummyTime",
  description: "Review your order and check out.",
};

export default function CartPage() {
  return (
    <>
      <Navigation />
      <CartView />
    </>
  );
}
