"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type Size = "S" | "M" | "L";

export interface CartItem {
  productId: number;
  name: string;
  subtitle: string;
  size: Size;
  price: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (productId: number, size: Size) => void;
  updateQty: (productId: number, size: Size, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const exists = prev.find(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (exists) {
        return prev.map((i) =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const remove = useCallback((productId: number, size: Size) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );
  }, []);

  const updateQty = useCallback(
    (productId: number, size: Size, qty: number) => {
      if (qty <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(i.productId === productId && i.size === size))
        );
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === productId && i.size === size ? { ...i, qty } : i
          )
        );
      }
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        updateQty,
        clear,
        total,
        count,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
