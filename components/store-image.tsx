"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { hostedImageUrl } from "@/lib/store-images";

type StoreImageProps = Omit<ImageProps, "src" | "onError"> & { src: string };

export function StoreImage({ src, ...props }: StoreImageProps) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const hostedSrc = hostedImageUrl(src);
  const imageSrc = failedPath === src ? hostedSrc : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      unoptimized
      onError={
        imageSrc === src && hostedSrc !== src
          ? () => setFailedPath(src)
          : undefined
      }
    />
  );
}
