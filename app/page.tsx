import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, MessageCircle, Truck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SocialIcons } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { products } from "@/content/products";
import { homeContent as copy, site } from "@/content/site";
import { formatPrice } from "@/lib/utils";
import collectionImage from "@/public/images/collection-landscape.png";
import oilImage from "@/public/images/hair-oil.jpg";
import shampooImage from "@/public/images/shampoo.jpg";
import lotionImage from "@/public/images/lotion.jpg";
import duoImage from "@/public/images/duo.jpg";

export const metadata: Metadata = {
  title: { absolute: site.name },
  alternates: { canonical: "/" },
};
const productImages = {
  "/images/hair-oil.jpg": oilImage,
  "/images/shampoo.jpg": shampooImage,
  "/images/lotion.jpg": lotionImage,
  "/images/duo.jpg": duoImage,
};

export default function HomePage() {
  return (
    <div id="home">
      <div className="bg-primary">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 text-xs font-medium sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 lg:col-start-2 lg:justify-center lg:gap-x-8">
            <span>{copy.announcement}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="hidden sm:inline">{copy.announcementOffer}</span>
          </div>
          <div className="justify-self-end">
            <SocialIcons />
          </div>
        </div>
      </div>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:py-7">
        <a href="#home" className="inline-flex min-h-11 items-center">
          <BrandMark />
        </a>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm lg:flex"
        >
          {site.navigation.map((item) => (
            <a
              className="hover:text-brand-deep flex min-h-11 items-center transition-colors"
              key={item.href}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={`https://wa.me/${site.contact.whatsapp}`}
          aria-label={copy.whatsappLabel}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border hover:bg-accent flex size-11 shrink-0 items-center justify-center rounded-full border"
        >
          <MessageCircle size={20} />
        </a>
      </header>

      <main id="main">
        <section className="w-full pb-14 lg:pb-20" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sr-only">
            {copy.title}
          </h1>
          <Image
            src={collectionImage}
            alt={copy.imageAlt}
            className="block h-auto w-full"
            sizes="100vw"
            placeholder="blur"
            preload
          />
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 pt-5 sm:px-8">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="#collection">
                  {copy.primaryAction}
                  <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#bundles">{copy.secondaryAction}</a>
              </Button>
            </div>
            <p className="text-muted-foreground flex max-w-xs items-start gap-2.5 text-xs leading-5">
              <Truck className="text-brand-deep mt-0.5 size-4 shrink-0" />
              {copy.announcementOffer}
            </p>
          </div>
          <p className="text-muted-foreground mt-4 px-5 text-center text-xs leading-5">
            {copy.previewLabel}
          </p>
        </section>

        <section
          id="collection"
          className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24"
          aria-labelledby="collection-title"
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-brand-deep mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
                {copy.collectionEyebrow}
              </p>
              <h2
                id="collection-title"
                className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
              >
                {copy.collectionTitle}
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {copy.collectionDescription}
              </p>
            </div>
            <ArrowDown
              className="text-brand-deep mb-1 hidden size-6 sm:block"
              aria-hidden="true"
            />
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.slug} id={product.category}>
                <div className="bg-muted relative overflow-hidden rounded-2xl">
                  <Image
                    src={
                      productImages[product.image as keyof typeof productImages]
                    }
                    alt={product.name}
                    className="h-auto w-full"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    placeholder="blur"
                  />
                  {product.shippingIncluded && (
                    <span className="bg-primary absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-semibold">
                      {copy.bundleBadge}
                    </span>
                  )}
                </div>
                <div className="pt-4">
                  <p className="text-muted-foreground mb-1.5 text-xs">
                    {product.size}
                  </p>
                  <h3 className="text-base leading-6 font-semibold tracking-tight">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-base font-medium">
                    {formatPrice(product.pricePaisa)}
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-6">
                    {product.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 max-w-2xl text-xs leading-5">
            {copy.draftNote}
          </p>
        </section>
      </main>

      <footer className="border-border bg-secondary border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <BrandMark />
            <p className="text-muted-foreground mt-3 max-w-sm text-xs leading-6">
              {copy.footerText}
            </p>
          </div>
          <a
            className="text-brand-deep inline-flex min-h-11 items-center gap-2 text-sm"
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            {site.contact.whatsappDisplay}
            <ArrowRight size={16} />
          </a>
        </div>
      </footer>

      <a
        href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(copy.whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.whatsappLabel}
        className="bg-brand-deep hover:bg-success fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-colors"
      >
        <MessageCircle className="size-7" aria-hidden="true" />
      </a>
    </div>
  );
}
