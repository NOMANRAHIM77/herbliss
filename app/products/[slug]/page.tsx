import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ChevronRight,
  ClipboardList,
  Leaf,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";
import { products } from "@/content/products";
import { productStories } from "@/content/product-stories";
import { productDetails as copy } from "@/content/product-details";
import { homeContent, site } from "@/content/site";
import { getDeliveryDates } from "@/lib/delivery-dates";
import { formatPrice } from "@/lib/utils";
import { hostedImageUrl } from "@/lib/store-images";
import {
  ProductGallery,
  type ProductImage,
} from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";

type Props = { params: Promise<{ slug: string }> };
const deliveryIcons = [ClipboardList, Truck, PackageCheck] as const;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: "/products/" + product.slug },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [hostedImageUrl(product.image)],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  await connection();
  const deliveryDates = getDeliveryDates(
    new Date(),
    site.shipping.estimatedWorkingDays,
  );
  const story = productStories[product.category];
  const components = (product.bundleComponents ?? [])
    .map((component) =>
      products.find((item) => item.id === component.productId),
    )
    .filter((item) => item !== undefined);
  const images: ProductImage[] = [
    { src: product.image, alt: product.name, label: copy.mainImage },
    ...components.map((item) => ({
      src: item.image,
      alt: item.name,
      label: item.shortName,
    })),
    {
      src: "/images/collection.jpg",
      alt: site.name + " hair oil, shampoo and body lotion",
      label: copy.collectionImage,
    },
  ];
  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-5 pt-5 pb-16 sm:px-8 lg:pb-24"
    >
      <nav aria-label="Breadcrumb" className="mb-7">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
          <li>
            <Link
              href="/"
              className="hover:text-brand-deep inline-flex min-h-11 items-center"
            >
              {copy.home}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li>
            <Link
              href="/#collection"
              className="hover:text-brand-deep inline-flex min-h-11 items-center"
            >
              {copy.collection}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page" className="text-foreground font-medium">
            {product.shortName}
          </li>
        </ol>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <ProductGallery key={product.id} images={images} />
        <div className="lg:pt-2">
          <p className="text-brand-deep mb-3 text-xs font-semibold tracking-[0.18em] uppercase">
            {site.name}
          </p>
          <h1 className="text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-5 text-3xl font-semibold tracking-tight">
            {formatPrice(product.pricePaisa)}
          </p>
          {product.shippingIncluded && (
            <span className="bg-primary mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
              {homeContent.bundleBadge}
            </span>
          )}
          <p className="text-muted-foreground mt-5 text-sm leading-7">
            {product.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.bundleComponents
              ? components.map((item) => (
                  <Link
                    key={item.id}
                    href={"/products/" + item.slug}
                    className="bg-secondary hover:border-brand-deep inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                  >
                    <Package size={15} aria-hidden="true" />
                    {item.size} {item.shortName}
                  </Link>
                ))
              : product.ingredients.slice(0, 4).map((ingredient) => (
                  <span
                    key={ingredient}
                    className="bg-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-5"
                  >
                    <Leaf
                      size={14}
                      className="text-brand-deep shrink-0"
                      aria-hidden="true"
                    />
                    {ingredient}
                  </span>
                ))}
          </div>
          <div className="mt-7">
            <p className="text-muted-foreground mb-3 text-sm">{copy.size}</p>
            <span className="bg-foreground inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-white">
              {product.size}
            </span>
            <span className="text-muted-foreground ml-3 text-xs">
              {product.bundleComponents ? copy.duoPack : copy.pack}
            </span>
          </div>
          <ProductPurchase key={product.id} product={product} />
          <section
            aria-labelledby="product-delivery-title"
            className="bg-brand-deep mt-4 rounded-2xl p-4 text-white sm:p-5"
          >
            <h2 id="product-delivery-title" className="text-sm font-semibold">
              {copy.delivery}
              {!product.shippingIncluded &&
                " · " + formatPrice(site.shipping.feePaisa)}
            </h2>
            <p className="mt-1 text-sm font-medium leading-5 text-white/90">
              {copy.deliveryEstimate}
            </p>
            <ol className="relative mt-4 grid grid-cols-3 before:pointer-events-none before:absolute before:inset-x-[16.6667%] before:top-5 before:border-t before:border-dashed before:border-white/50">
              {deliveryIcons.map((Icon, index) => (
                <li
                  key={copy.deliverySteps[index]}
                  className="relative flex flex-col items-center gap-2 px-1 text-center text-xs leading-4 font-medium"
                >
                  <span className="text-brand-deep grid size-10 place-items-center rounded-full bg-white">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p>{copy.deliverySteps[index]}</p>
                    <p className="mt-1.5 text-xs font-normal text-white/90 tabular-nums">
                      {deliveryDates[index]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {product.shippingIncluded && (
              <p className="mt-4 border-t border-white/25 pt-3 text-xs leading-5 text-white/90">
                {copy.freeDelivery}
              </p>
            )}
          </section>
          <div className="mt-7 divide-y border-y">
            <details open className="py-4">
              <summary className="cursor-pointer py-1 text-sm font-semibold">
                {copy.ingredients}
              </summary>
              <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                {copy.ingredientsNote}
              </p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer py-1 text-sm font-semibold">
                {copy.usage}
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-7">
                {product.usage}
              </p>
              {components.map((item) => (
                <div key={item.id} className="mt-3 text-sm leading-7">
                  <p className="font-medium">{item.shortName}</p>
                  <p className="text-muted-foreground">{item.usage}</p>
                </div>
              ))}
            </details>
          </div>
          <p className="text-muted-foreground mt-5 text-xs leading-5">
            {homeContent.draftNote}
          </p>
        </div>
      </div>
      <section aria-labelledby="product-description" className="mt-12 rounded-3xl border border-brand-deep/10 bg-secondary/60 p-6 sm:p-10 lg:mt-16">
        <div className="max-w-4xl">
          <h2 id="product-description" className="mb-6 text-2xl font-semibold tracking-tight">{copy.description}</h2>
          <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <ul className="my-7 grid gap-3 sm:grid-cols-2">
            {story.highlights.map(highlight => (
              <li key={highlight.text} className="flex items-start gap-3 rounded-xl border border-brand-deep/10 bg-white px-4 py-3 text-sm leading-6">
                <span aria-hidden="true" className="shrink-0 text-lg">{highlight.icon}</span>
                <span>{highlight.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{story.closing}</p>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">{homeContent.draftNote}</p>
        </div>
      </section>
    </main>
  );
}
