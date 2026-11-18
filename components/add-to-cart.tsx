"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
export function AddToCart({ id }: { id: string }) {
  const { add, ready } = useCart();
  const [message, setMessage] = useState("");
  return (
    <div className="mt-4">
      <Button
        disabled={!ready}
        onClick={() =>
          setMessage(
            add(id)
              ? "Added to your cart."
              : "Available quantity is already in your cart.",
          )
        }
      >
        <ShoppingCart />
        Add to cart
      </Button>
      <p
        role="status"
        className="text-brand-deep mt-2 min-h-10 text-xs leading-5"
      >
        {message}
      </p>
    </div>
  );
}
