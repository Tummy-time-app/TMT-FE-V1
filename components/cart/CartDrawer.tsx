"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { SafeImage } from "@/components/ui/SafeImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";
import { StoreIcon } from "@/components/icons";
import "./CartDrawer.css";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * Extracted from RestaurantView.tsx's page-local `.rp-cart-drawer` (which
 * duplicated markup already generic to "whatever's in the cart") — reads
 * straight from the global useCart(), so it works from anywhere, not just
 * mid-order on a restaurant page. See MiniCartBar.tsx for the trigger.
 */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, changeQty, cartTotal } = useCart();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Your order"
      footer={
        <>
          <div className="tmt-cart-drawer__total">
            <span>Total</span>
            <span>{formatNaira(cartTotal)}</span>
          </div>
          <Link href="/cart" className="tmt-cart-drawer__cta" onClick={onClose}>
            Go to cart →
          </Link>
        </>
      }
    >
      {cart.restaurantName && (
        <div className="tmt-cart-drawer__vendor">
          <StoreIcon width={16} height={16} />
          <span>{cart.restaurantName}</span>
        </div>
      )}
      <div className="tmt-cart-drawer__items">
        {cart.entries.map((entry) => (
          <div key={entry.item.id} className="tmt-cart-drawer__entry">
            <div className="tmt-cart-drawer__img-wrap">
              <SafeImage src={entry.item.imageUrl} alt={entry.item.name} fill />
            </div>
            <div className="tmt-cart-drawer__body">
              <p className="tmt-cart-drawer__name">{entry.item.name}</p>
              <p className="tmt-cart-drawer__price">{formatNaira(Number(entry.item.price) * entry.qty)}</p>
            </div>
            <QuantityStepper
              value={entry.qty}
              min={0}
              size="sm"
              onDecrease={() => changeQty(entry.item.id, -1)}
              onIncrease={() => changeQty(entry.item.id, 1)}
            />
          </div>
        ))}
      </div>
    </Sheet>
  );
}
