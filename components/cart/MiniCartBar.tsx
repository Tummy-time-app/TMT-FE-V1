"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { CartDrawer } from "./CartDrawer";
import "./MiniCartBar.css";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * Global floating cart summary — mounted once in app/layout.tsx so it
 * follows the customer across the whole marketplace, not just the
 * restaurant detail page (where the only version of this used to live,
 * as `.rp-cart-bar`). Hidden on /cart itself — a floating "view cart"
 * bar pointing at the page you're already on is just noise.
 */
export function MiniCartBar() {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useCart();
  const [open, setOpen] = useState(false);

  if (cartCount === 0 || pathname === "/cart") return null;

  return (
    <>
      <button type="button" className="tmt-mini-cart" onClick={() => setOpen(true)}>
        <span className="tmt-mini-cart__count">{cartCount}</span>
        <span className="tmt-mini-cart__label">View cart</span>
        <span className="tmt-mini-cart__total">{formatNaira(cartTotal)}</span>
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
