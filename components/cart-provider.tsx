"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import { cleanCart, type CartItem } from "@/lib/cart";

const key = "herbliss-cart-v1";
const changed = "herbliss-cart-changed";
const empty: CartItem[] = [];
let lastRaw: string | null | undefined;
let snapshot: CartItem[] = empty;
let memory: CartItem[] = empty;
let memoryOnly = false;
function read() {
  if (memoryOnly) return memory;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== lastRaw) {
      lastRaw = raw;
      try {
        snapshot = cleanCart(raw ? JSON.parse(raw) : []);
      } catch {
        snapshot = empty;
      }
    }
    return snapshot;
  } catch {
    return memory;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changed, listener);
  };
}
function write(items: CartItem[]) {
  memory = cleanCart(items);
  try {
    localStorage.setItem(key, JSON.stringify(memory));
  } catch {
    memoryOnly = true;
  }
  window.dispatchEvent(new Event(changed));
}
type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  add: (id: string, quantity?: number) => boolean;
  setQuantity: (id: string, quantity: number) => boolean;
};
const CartContext = createContext<CartContextValue | null>(null);
const subscribeReady = () => () => {};
export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => empty);
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  function add(id: string, quantity = 1) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
    const current = read();
    const existing = current.find((item) => item.id === id);
    const next = cleanCart(
      existing
        ? current.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { id, quantity }],
    );
    const added =
      (next.find((item) => item.id === id)?.quantity ?? 0) ===
        (existing?.quantity ?? 0) + quantity &&
      current.every(
        (item) =>
          item.id === id ||
          next.find((line) => line.id === item.id)?.quantity === item.quantity,
      );
    if (added) write(next);
    return added;
  }
  function setQuantity(id: string, quantity: number) {
    const proposed = read()
      .map((item) => (item.id === id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    const next = cleanCart(proposed);
    if (JSON.stringify(proposed) !== JSON.stringify(next)) return false;
    write(next);
    return true;
  }
  return (
    <CartContext.Provider value={{ items, ready, add, setQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("Cart provider is missing");
  return cart;
}
