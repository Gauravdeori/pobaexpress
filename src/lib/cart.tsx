import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { deliveryFee, type MenuItem } from "./menu";

export type CartCategory = "food" | "cake" | "medicine";

/** What the cart stores per line. Price is copied in so a later price change
 *  can never silently alter an order already in progress. */
export type CartLine = {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
};

export type CartState = {
  category: CartCategory;
  /** Which shop the lines came from, for the header and the order record. */
  source: string | null;
  lines: CartLine[];
};

const EMPTY: CartState = { category: "food", source: null, lines: [] };

const STORAGE_KEY = "poba.cart.v1";

type CartContextValue = {
  cart: CartState;
  count: number;
  subtotal: number;
  fee: number;
  total: number;
  /** True when adding from `source` would discard what is already in the cart. */
  conflicts: (category: CartCategory, source: string | null) => boolean;
  add: (item: MenuItem, category: CartCategory, source: string | null) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function read(): CartState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed?.lines)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Seeded empty on both server and first client render, then hydrated from
  // storage in an effect — reading localStorage during render would make the
  // server and client markup disagree.
  const [cart, setCart] = useState<CartState>(EMPTY);

  useEffect(() => setCart(read()), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Private mode and full quotas both throw. The cart still works for this
      // session; it just will not survive a reload.
    }
  }, [cart]);

  const conflicts = useCallback(
    (category: CartCategory, source: string | null) =>
      cart.lines.length > 0 && (cart.category !== category || cart.source !== source),
    [cart],
  );

  const add = useCallback((item: MenuItem, category: CartCategory, source: string | null) => {
    setCart((current) => {
      // One shop at a time: the delivery fee and the pickup are both per-shop,
      // so a mixed cart cannot be priced or dispatched as one order.
      const fresh =
        current.lines.length > 0 && (current.category !== category || current.source !== source);
      const lines = fresh ? [] : current.lines;
      const existing = lines.find((line) => line.id === item.id);
      const next = existing
        ? lines.map((line) =>
            line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
          )
        : [
            ...lines,
            {
              id: item.id,
              name: item.name,
              variant: item.variant,
              price: item.price,
              quantity: 1,
            },
          ];
      return { category, source, lines: next };
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) => ({
      ...current,
      lines:
        quantity > 0
          ? current.lines.map((line) => (line.id === id ? { ...line, quantity } : line))
          : current.lines.filter((line) => line.id !== id),
    }));
  }, []);

  const clear = useCallback(() => setCart(EMPTY), []);

  const value = useMemo<CartContextValue>(() => {
    const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const fee = cart.lines.length > 0 ? deliveryFee(cart.category) : 0;
    return {
      cart,
      count,
      subtotal,
      fee,
      total: subtotal + fee,
      conflicts,
      add,
      setQuantity,
      clear,
    };
  }, [cart, conflicts, add, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
