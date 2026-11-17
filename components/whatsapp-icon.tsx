import Image from "next/image";
import { homeContent, site } from "@/content/site";

export const whatsappUrl = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(homeContent.whatsappMessage)}`;

/** Unmodified WhatsApp logo from the official website; see docs/ASSET_SOURCES.md. */
export function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <Image
      src="/icons/whatsapp.svg"
      alt=""
      width={size}
      height={size}
      unoptimized
      aria-hidden="true"
    />
  );
}
