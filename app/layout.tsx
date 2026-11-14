import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getEnv } from "@/lib/env";
import { homeContent, site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getEnv().NEXT_PUBLIC_APP_URL),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: homeContent.description,
  // This is a development preview; indexable product pages arrive in Phase 2.
  robots: { index: false, follow: false },
  openGraph: {
    title: site.name,
    description: homeContent.description,
    images: ["/images/collection.jpg"],
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
        <a
          href="#main"
          className="bg-primary fixed top-3 left-3 z-50 -translate-y-24 rounded-full px-5 py-3 font-semibold focus:translate-y-0"
        >
          {homeContent.skipLink}
        </a>
        {children}
      </body>
    </html>
  );
}
