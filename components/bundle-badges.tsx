import { Tag, Truck } from "lucide-react";
import { products, type PreviewProduct } from "@/content/products";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";

export function BundleBadges({ product }: { product: PreviewProduct }) {
  if (!product.shippingIncluded) return null;
  const separatePrice = (product.bundleComponents ?? []).reduce(
    (sum, component) =>
      sum +
      (products.find((item) => item.id === component.productId)?.pricePaisa ??
        0) *
        component.quantity,
    0,
  );
  const deliveredPrice = separatePrice + site.shipping.feePaisa;
  const savings = Math.max(0, deliveredPrice - product.pricePaisa);
  const percent =
    deliveredPrice > 0 ? Math.floor((savings / deliveredPrice) * 100) : 0;

  return (
    <div className="flex flex-col items-end gap-1.5">
      {percent > 0 && (
        <span
          title={`${formatPrice(savings)} saved versus individual products plus ${formatPrice(site.shipping.feePaisa)} delivery.`}
          className="bg-foreground inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[8px] font-semibold text-white shadow-sm sm:px-2.5 sm:text-[10px]"
        >
          <Tag size={12} aria-hidden="true" />
          Save {percent}% incl. delivery
        </span>
      )}
      <span className="bg-primary text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[8px] font-semibold shadow-sm sm:px-2.5 sm:text-[10px]">
        <Truck size={12} aria-hidden="true" />
        Free delivery
      </span>
    </div>
  );
}
