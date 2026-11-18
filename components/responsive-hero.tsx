"use client";
import { useState } from "react";
import { hostedImageUrl } from "@/lib/store-images";

/** Art direction keeps the supplied square artwork readable on phones. */
export function ResponsiveHero({ alt }: { alt: string }) {
  const [hosted, setHosted] = useState(false);
  const source = (path: string) => (hosted ? hostedImageUrl(path) : path);
  return (
    <picture>
      <source
        media="(max-width: 639px)"
        srcSet={source("/images/collection.jpg")}
      />
      {/* A picture element selects the artwork before downloading the image. */}
      <img
        src={source("/images/collection-landscape.png")}
        width={2048}
        height={768}
        alt={alt}
        fetchPriority="high"
        loading="eager"
        onError={hosted ? undefined : () => setHosted(true)}
        className="block aspect-square h-auto w-full object-contain sm:aspect-[8/3]"
      />
    </picture>
  );
}
