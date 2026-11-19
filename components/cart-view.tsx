"use client";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cartTotals } from "@/lib/cart";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StoreImage } from "@/components/store-image";
import { useState } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import type { CheckoutCustomer } from "@/lib/checkout";

export function CartView({ customer }: { customer?: CheckoutCustomer }) {
  const checkout = Boolean(customer);
  const [message, setMessage] = useState("");
  const { items, ready, setQuantity } = useCart();
  const { lines, subtotal, delivery, total } = cartTotals(items);
  if (!ready) return <p role="status">Loading your cart…</p>;
  if (!lines.length)
    return (
      <div className="bg-secondary rounded-2xl border px-6 py-12 text-center">
        <ShoppingCart size={40} className="text-brand-deep mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-3">
          Add your care essentials to get started.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button disabled>Checkout</Button>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Add an item to enable checkout.
        </p>
      </div>
    );
  const summary = (
    <section
      aria-labelledby="order-summary-title"
      className={
        checkout
          ? "border-success/20 mt-5 border-t pt-5"
          : "bg-secondary rounded-2xl border p-6"
      }
    >
      <p role="status" className="text-success mb-3 text-sm empty:mb-0">
        {message}
      </p>
      <h2 id="order-summary-title" className="mb-4 text-xl font-semibold">
        Order summary
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Delivery across Pakistan</dt>
          <dd>{delivery ? formatPrice(delivery) : "Free"}</dd>
        </div>
        <div
          className={cn(
            "flex justify-between gap-4 border-t pt-3 text-lg font-semibold",
            checkout && "border-success/20 text-success",
          )}
        >
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {delivery === 0 && (
        <p className="text-success mt-3 text-xs">
          Your duo includes free delivery for the whole order.
        </p>
      )}
      {checkout ? (
        <Button
          asChild
          variant="outline"
          className="border-success/35 text-success hover:border-success hover:bg-success focus-visible:border-success focus-visible:bg-success mt-5 w-full bg-white hover:text-white focus-visible:text-white"
        >
          <Link href="/cart">Edit cart</Link>
        </Button>
      ) : (
        <Button asChild className="mt-6 w-full">
          <Link href="/checkout" prefetch={false}>
            Checkout
          </Link>
        </Button>
      )}
    </section>
  );

  return (
    <div
      className={cn(
        "grid items-start gap-8",
        checkout
          ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          : "lg:grid-cols-[1fr_22rem]",
      )}
    >
      <div
        className={
          checkout
            ? "text-foreground min-w-0 rounded-2xl border border-[#c9dccc] bg-[#e8f1e9] p-4 sm:p-6"
            : "space-y-4"
        }
      >
        <div className={checkout ? "divide-success/20 divide-y" : "space-y-4"}>
          {lines.map(({ product, quantity }) => (
            <article
              key={product.id}
              className={cn(
                "flex gap-4 sm:gap-6",
                checkout
                  ? "py-4 first:pt-0 last:pb-0"
                  : "rounded-xl border p-4",
              )}
            >
              <StoreImage
                src={product.image}
                alt={product.name}
                width={100}
                height={133}
                className="h-32 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{product.name}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {product.size}
                </p>
                <p className="mt-2 text-sm">
                  {formatPrice(product.pricePaisa)} each
                </p>
                {checkout ? (
                  <p className="text-success mt-2 inline-flex rounded-full bg-[#cee5d2] px-2.5 py-1 text-xs font-semibold">
                    Quantity: {quantity}
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      className="hover:bg-secondary flex size-11 items-center justify-center rounded-lg border disabled:opacity-40"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={"Decrease " + product.shortName + " quantity"}
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      className="min-w-6 text-center"
                      aria-label={"Quantity " + quantity}
                    >
                      {quantity}
                    </span>
                    <button
                      className="hover:bg-secondary flex size-11 items-center justify-center rounded-lg border"
                      onClick={() =>
                        setMessage(
                          setQuantity(product.id, quantity + 1)
                            ? "Quantity updated."
                            : "Available quantity is already in your cart, including any duo items.",
                        )
                      }
                      aria-label={"Increase " + product.shortName + " quantity"}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="text-muted-foreground hover:bg-secondary flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs"
                      onClick={() => setQuantity(product.id, 0)}
                      aria-label={"Remove " + product.shortName}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                )}
                <p className="mt-2 font-medium">
                  {formatPrice(product.pricePaisa * quantity)}
                </p>
              </div>
            </article>
          ))}
        </div>
        {checkout ? (
          summary
        ) : (
          <p className="text-muted-foreground text-xs leading-5">
            Quantities are limited to the current catalog allocation. The duo
            shares oil and shampoo quantities. Availability will be confirmed
            before ordering.
          </p>
        )}
      </div>
      {customer ? (
        <CheckoutForm customer={customer} items={items} total={total} />
      ) : (
        summary
      )}
    </div>
  );
}
