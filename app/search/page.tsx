import Link from "next/link";
import { StoreImage } from "@/components/store-image";
import { products } from "@/content/products";
import { productDetails } from "@/content/product-details";
import { formatPrice } from "@/lib/utils";
import { StorePage } from "@/components/store-page";
import { BundleBadges } from "@/components/bundle-badges";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Search" };
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "")
    .trim()
    .slice(0, 100);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length
    ? products.filter((product) => {
        const text = [
          product.name,
          product.category.replaceAll("-", " "),
          product.description,
          ...product.ingredients,
        ]
          .join(" ")
          .toLowerCase();
        return terms.every((term) => text.includes(term));
      })
    : [];
  return (
    <StorePage title="Search the collection">
      <form
        action="/search"
        role="search"
        className="mb-8 flex max-w-xl flex-wrap gap-3"
      >
        <label className="sr-only" htmlFor="product-query">
          Search products
        </label>
        <input
          id="product-query"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={100}
          placeholder="Try oil, shampoo or amla"
          className="min-w-0 flex-1 rounded-lg border px-4 py-3"
        />
        <Button type="submit">Search</Button>
      </form>
      {!query ? (
        <p className="text-muted-foreground">
          Enter a product name, ingredient or category to get started.
        </p>
      ) : (
        <>
          <p role="status" className="text-muted-foreground mb-6 text-sm">
            {results.length} {results.length === 1 ? "result" : "results"} for “
            {query}”
          </p>
          {results.length === 0 ? (
            <div className="bg-secondary rounded-xl p-6">
              <p>No products found. Try “oil”, “shampoo”, “lotion” or “duo”.</p>
              <Link
                href="/#collection"
                className="text-brand-deep mt-4 inline-block underline"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
              {results.map((product) => (
                <article key={product.id} className="mx-auto flex h-full w-full max-w-72 flex-col">
                  <div className="mb-2 flex h-16 items-end justify-end">
                    <BundleBadges product={product} />
                  </div>
                  <Link href={"/products/" + product.slug} className="relative block aspect-[3/4] shrink-0 overflow-hidden rounded-xl">
                    <StoreImage
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={533}
                      className="block h-full w-full object-cover"
                      sizes="(max-width: 1023px) 288px, 241px"
                    />
                  </Link>
                  <h2 className="mt-4 min-h-12 text-sm leading-6 font-semibold">
                    <Link href={"/products/" + product.slug}>
                      {product.name}
                    </Link>
                  </h2>
                  <p className="mt-2">{formatPrice(product.pricePaisa)}</p>
                  <div className="mt-auto pt-4">
                    <Button asChild className="w-full">
                      <Link href={"/products/" + product.slug}>
                        {productDetails.viewDetails}
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </StorePage>
  );
}
