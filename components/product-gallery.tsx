"use client";

import { useState } from "react";
import { StoreImage } from "@/components/store-image";
import { productDetails as copy } from "@/content/product-details";

export type ProductImage = { src: string; alt: string; label: string };

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  return (
    <div className="max-w-full min-w-0">
      <div className="border-brand-deep/10 bg-secondary relative aspect-[3/4] overflow-hidden rounded-3xl border shadow-sm">
        <StoreImage
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 1023px) 100vw, 45vw"
          className="object-contain"
          preload
        />
      </div>
      <div
        role="group"
        aria-label={copy.gallery}
        className="mt-4 flex gap-3 overflow-x-auto p-1"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={image.label}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:size-24 ${selected === index ? "border-brand-deep bg-secondary ring-primary/60 ring-2" : "bg-secondary hover:border-brand-deep/40 border-transparent"}`}
          >
            <StoreImage
              src={image.src}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <p
        aria-live="polite"
        className="text-muted-foreground mt-2 text-center text-xs"
      >
        {current.label}
      </p>
    </div>
  );
}
