"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ── Shared cart item type ────────────────────────────── */
export interface CartItem {
  id: number;
  name: string;
  description: string;
  vendor: string;
  vendorId: string;
  price: number;
  qty: number;
  image: string;
  note?: string;
}

/* ── Context shape ────────────────────────────────────── */
interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;

  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  updateNote: (id: number, note: string) => void;
  clearCart: () => void;
  getItemQty: (id: number) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  const clearCart = useCallback(() => setItems([]), []);

  const getItemQty = useCallback(
    (id: number) => items.find(i => i.id === id)?.qty ?? 0,
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, cartCount, cartTotal, addItem, removeItem, changeQty, updateNote, clearCart, getItemQty }}
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
