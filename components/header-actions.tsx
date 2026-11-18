"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Search, UserRound, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
const iconClass =
  "flex size-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-primary focus-visible:bg-primary motion-reduce:transition-none";
export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="relative ml-auto flex shrink-0 items-center gap-0 sm:gap-1 lg:ml-0">
      <button
        ref={toggle}
        type="button"
        className={iconClass}
        aria-label={open ? "Close search" : "Search products"}
        aria-expanded={open}
        aria-controls="header-search"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={21} /> : <Search size={21} />}
      </button>
      <Link
        href="/profile"
        prefetch={false}
        className={iconClass}
        aria-label="Your account"
      >
        <UserRound size={21} />
      </Link>
      <Link
        href="/cart"
        className={iconClass + " relative"}
        aria-label={"Cart, " + count + " items"}
      >
        <ShoppingCart size={21} />
        {count > 0 && (
          <span className="bg-brand-deep absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white">
            {count}
          </span>
        )}
      </Link>
      {open && (
        <form
          id="header-search"
          action="/search"
          role="search"
          className="absolute top-full -right-11 z-40 mt-3 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border bg-white p-4 shadow-xl xl:right-0"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          <label
            htmlFor="header-query"
            className="mb-2 block text-sm font-medium"
          >
            Search the collection
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              id="header-query"
              name="q"
              type="search"
              required
              maxLength={100}
              placeholder="Oil, shampoo, ingredients…"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            />
            <button
              className={iconClass + " bg-primary"}
              aria-label="Submit search"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
