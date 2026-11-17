"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { products, type PreviewProduct } from "@/content/products";
import { productDetails as copy } from "@/content/product-details";
import { formatPrice } from "@/lib/utils";

export function ProductPurchase({ product }: { product: PreviewProduct }) {
  const { items, add, ready } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const required = product.bundleComponents ?? [
    { productId: product.id, quantity: 1 },
  ];
  const available = Math.max(
    0,
    Math.min(
      ...required.map((part) => {
        const stock =
          products.find((item) => item.id === part.productId)?.initialStock ??
          0;
        const used = items.reduce((sum, item) => {
          const catalogItem = products.find((entry) => entry.id === item.id);
          const components = catalogItem?.bundleComponents ?? [
            { productId: item.id, quantity: 1 },
          ];
          return (
            sum +
            (components.find(
              (component) => component.productId === part.productId,
            )?.quantity ?? 0) *
              item.quantity
          );
        }, 0);
        return Math.floor((stock - used) / part.quantity);
      }),
    ),
  );
  const selectedQuantity = Math.min(quantity, Math.max(available, 1));

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p id="quantity-label" className="text-muted-foreground mb-3 text-sm">
            {copy.quantity}
          </p>
          <div
            role="group"
            aria-labelledby="quantity-label"
            className="border-brand-deep/25 inline-flex items-center rounded-full border p-1"
          >
            <button
              type="button"
              aria-label={copy.decrease}
              disabled={!ready || selectedQuantity <= 1}
              onClick={() => setQuantity(selectedQuantity - 1)}
              className="hover:bg-secondary flex size-11 items-center justify-center rounded-full disabled:opacity-30"
            >
              <Minus size={17} />
            </button>
            <span
              className="min-w-12 text-center text-sm font-semibold"
              aria-live="polite"
            >
              {selectedQuantity}
            </span>
            <button
              type="button"
              aria-label={copy.increase}
              disabled={!ready || selectedQuantity >= available}
              onClick={() => setQuantity(selectedQuantity + 1)}
              className="hover:bg-secondary flex size-11 items-center justify-center rounded-full disabled:opacity-30"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
        <p className="text-muted-foreground pb-2 text-right text-sm">
          {copy.total}
          <span className="text-foreground mt-1 block text-lg font-semibold">
            {formatPrice(product.pricePaisa * selectedQuantity)}
          </span>
        </p>
      </div>
      <Button
        className="mt-6 min-h-14 w-full text-base"
        disabled={!ready || available === 0}
        onClick={() => {
          const success = add(product.id, selectedQuantity);
          setAdded(success);
          setMessage(success ? copy.added : copy.quantityChanged);
        }}
      >
        <ShoppingBag />
        {copy.addToCart}
      </Button>
      {ready && available === 0 && (
        <p className="text-muted-foreground mt-3 text-sm">{copy.unavailable}</p>
      )}
      <p role="status" className="text-brand-deep mt-3 text-sm">
        {message}
      </p>
      {added && (
        <Link
          href="/cart"
          className="text-brand-deep mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          {copy.viewCart}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
