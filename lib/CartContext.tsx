"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ── Shared cart item type ────────────────────────────── */
export interface CartItem {
  id: number;
  name: string;
  description: string;
  vendor: string;
  vendorId: string;
  /** Which of the three storefronts this came from — lets checkout/cart link back to the right listing page. */
  vendorBusinessType?: "restaurant" | "shop" | "market";
  price: number;
  qty: number;
  image: string;
  note?: string;
  /** Grocery items (shops/markets) only — "each" (default) or "weight" (sold per kg). Drives display formatting and the cart stepper's increment size — see lib/utils/quantity.ts. */
  unitType?: "each" | "weight";
  weightUnit?: "g" | "kg";
  /** Whether a rider may substitute this item if it's unavailable at fulfillment — perishables mostly. */
  substitutionAllowed?: boolean;
}

/* ── Applied promo code ──────────────────────────────── */
export interface AppliedPromo {
  code: string;
  discountAmount: number;
}

/* ── Context shape ────────────────────────────────────── */
interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  appliedPromo: AppliedPromo | null;

  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  updateNote: (id: number, note: string) => void;
  clearCart: () => void;
  getItemQty: (id: number) => number;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.vendorId === item.vendorId);
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.vendorId === item.vendorId
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setItems(prev =>
      prev
        .map(i => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter(i => i.qty > 0)
    );
  }, []);

  const updateNote = useCallback((id: number, note: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, note } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  const getItemQty = useCallback(
    (id: number) => items.find(i => i.id === id)?.qty ?? 0,
    [items]
  );

  const applyPromo = useCallback((promo: AppliedPromo) => setAppliedPromo(promo), []);
  const removePromo = useCallback(() => setAppliedPromo(null), []);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        appliedPromo,
        addItem,
        removeItem,
        changeQty,
        updateNote,
        clearCart,
        getItemQty,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
