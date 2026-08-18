"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem } from "@/features/restaurants/types";

/**
 * A real, shared cart — replacing both RestaurantClient.tsx's page-local
 * cart state and app/cart/page.tsx's static lib/cartData.ts seed array on
 * the `frontend` branch (neither talked to the other; adding an item on a
 * restaurant page never showed up on /cart there). Persisted to
 * localStorage like ProfileContext, so it survives a reload.
 *
 * A cart can only ever belong to one restaurant — CreateOrderPayload
 * (features/orders/types.ts) takes a single restaurantId — so adding an
 * item from a different restaurant than what's already in the cart starts
 * a fresh one rather than mixing vendors into an order that couldn't
 * actually be placed.
 */
export interface CartEntry {
  item: MenuItem;
  qty: number;
  note?: string;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  entries: CartEntry[];
}

const emptyCart: CartState = { restaurantId: null, restaurantName: null, entries: [] };

const STORAGE_KEY = "tummytime_cart";

interface CartContextValue {
  cart: CartState;
  addItem: (restaurantId: string, restaurantName: string, item: MenuItem, qty: number) => void;
  changeQty: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCart({ ...emptyCart, ...JSON.parse(raw) });
    } catch {
      // malformed or unavailable storage — fall back to the empty cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage unavailable — in-memory state still works
    }
  }, [cart, hydrated]);

  const addItem = useCallback(
    (restaurantId: string, restaurantName: string, item: MenuItem, qty: number) => {
      setCart((prev) => {
        const base = prev.restaurantId && prev.restaurantId !== restaurantId ? emptyCart : prev;
        const existing = base.entries.find((e) => e.item.id === item.id);
        const entries = existing
          ? base.entries.map((e) => (e.item.id === item.id ? { ...e, qty: e.qty + qty } : e))
          : [...base.entries, { item, qty }];
        return { restaurantId, restaurantName, entries };
      });
    },
    [],
  );

  const changeQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      const entries = prev.entries
        .map((e) => (e.item.id === itemId ? { ...e, qty: Math.max(0, e.qty + delta) } : e))
        .filter((e) => e.qty > 0);
      return entries.length === 0 ? emptyCart : { ...prev, entries };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((prev) => {
      const entries = prev.entries.filter((e) => e.item.id !== itemId);
      return entries.length === 0 ? emptyCart : { ...prev, entries };
    });
  }, []);

  const updateNote = useCallback((itemId: string, note: string) => {
    setCart((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.item.id === itemId ? { ...e, note } : e)),
    }));
  }, []);

  const clearCart = useCallback(() => setCart(emptyCart), []);

  const cartCount = cart.entries.reduce((s, e) => s + e.qty, 0);
  const cartTotal = cart.entries.reduce((s, e) => s + Number(e.item.price) * e.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, changeQty, removeItem, updateNote, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
