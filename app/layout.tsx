import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { parseStorefrontEnv } from "@/lib/env-schema";
import { hostedImageUrl } from "@/lib/store-images";
import { homeContent, site } from "@/content/site";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeafIntro } from "@/components/leaf-intro";
import { WhatsAppIcon, whatsappUrl } from "@/components/whatsapp-icon";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(parseStorefrontEnv(process.env).NEXT_PUBLIC_APP_URL),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: homeContent.description,
  // This is a development preview; indexable product pages arrive in Phase 2.
  robots: { index: false, follow: false },
  openGraph: {
    title: site.name,
    description: homeContent.description,
    images: [hostedImageUrl("/images/collection.jpg")],
    locale: "en_PK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className={inter.variable}>
      <body>
        <LeafIntro />
        <a
          href="#main"
          className="bg-primary fixed top-3 left-3 z-50 -translate-y-24 rounded-full px-5 py-3 font-semibold focus:translate-y-0"
        >
          {homeContent.skipLink}
        </a>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <a
            href={whatsappUrl}
            aria-label={homeContent.whatsappLabel}
            className="whatsapp-widget border-primary/70 fixed right-5 bottom-5 z-30 flex size-16 items-center justify-center rounded-full border-2 bg-[#123c2a] shadow-[0_0_0_5px_#8aff8a20,0_6px_28px_#123c2a66] hover:brightness-110"
          >
            <WhatsAppIcon size={40} />
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
