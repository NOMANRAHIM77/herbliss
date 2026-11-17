import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { productDetails } from "@/content/product-details";
import { ArrowDown, ArrowRight, Truck } from "lucide-react";
import { BundleBadges } from "@/components/bundle-badges";
import { CareSection } from "@/components/care-section";
import { IngredientSection } from "@/components/ingredient-section";
import { IngredientLibrary } from "@/components/ingredient-library";
import { VideoGallery } from "@/components/video-gallery";
import { FaqSection } from "@/components/faq-section";
import { StoreImage } from "@/components/store-image";

import { Button } from "@/components/ui/button";
import { products } from "@/content/products";
import { homeContent as copy, site } from "@/content/site";
import { videoContent } from "@/content/videos";
import { formatPrice } from "@/lib/utils";
import { listVideos } from "@/lib/videos";

export const metadata: Metadata = {
  title: { absolute: site.name },
  alternates: { canonical: "/" },
};
async function HomeVideos() {
  await connection();
  const videos = await listVideos().catch(() => null);
  return <VideoGallery initialVideos={videos} />;
}

export default function HomePage() {
  return (
    <div id="home">
      <main id="main">
        <section className="w-full pb-14 lg:pb-20" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sr-only">
            {copy.title}
          </h1>
          <StoreImage
            src="/images/collection-landscape.png"
            alt={copy.imageAlt}
            width={2048}
            height={768}
            className="block h-auto w-full"
            sizes="100vw"
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
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
            {products.map((product) => (
              <article
                key={product.slug}
                id={product.category}
                className="mx-auto flex h-full w-full max-w-72 flex-col"
              >
                <div className="mb-2 flex h-16 items-end justify-end">
                  <BundleBadges product={product} />
                </div>
                <Link
                  href={"/products/" + product.slug}
                  className="group relative block aspect-[3/4] shrink-0 overflow-hidden rounded-2xl"
                >
                  <StoreImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none"
                    sizes="(max-width: 1023px) 288px, 241px"
                  />
                </Link>
                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="min-h-12 text-sm leading-6 font-semibold tracking-tight">
                    <Link
                      href={"/products/" + product.slug}
                      className="hover:text-brand-deep"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-base font-medium">
                    {formatPrice(product.pricePaisa)}
                  </p>
                  <div className="mt-auto pt-4">
                    <Button asChild className="w-full">
                      <Link href={"/products/" + product.slug}>
                        {productDetails.viewDetails}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 max-w-2xl text-xs leading-5">
            {copy.draftNote}
          </p>
        </section>
        <IngredientSection />
        <Suspense
          fallback={
            <p role="status" className="text-muted-foreground mx-auto max-w-7xl px-5 py-8 text-sm sm:px-8">
              {videoContent.loading}
            </p>
          }
        >
          <HomeVideos />
        </Suspense>
        <IngredientLibrary />
        <CareSection />
        <FaqSection />
      </main>
    </div>
  );
}
