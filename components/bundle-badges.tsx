import { Tag, Truck } from "lucide-react";
import { products, type PreviewProduct } from "@/content/products";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";

export function BundleBadges({ product }: { product: PreviewProduct }) {
  if (!product.shippingIncluded) return null;
  const separatePrice = (product.bundleComponents ?? []).reduce((sum, component) =>
    sum + (products.find(item => item.id === component.productId)?.pricePaisa ?? 0) * component.quantity, 0);
  const deliveredPrice = separatePrice + site.shipping.feePaisa;
  const savings = Math.max(0, deliveredPrice - product.pricePaisa);
  const percent = deliveredPrice > 0 ? Math.floor(savings / deliveredPrice * 100) : 0;

  return (
    <div className="flex flex-col items-end gap-1.5">
      {percent > 0 && (
        <span
          title={`${formatPrice(savings)} saved versus individual products plus ${formatPrice(site.shipping.feePaisa)} delivery.`}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-sm"
        >
          <Tag size={12} aria-hidden="true" />Save {percent}% incl. delivery
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1.5 text-[10px] font-semibold text-foreground shadow-sm">
        <Truck size={12} aria-hidden="true" />Free delivery
      </span>
    </div>
  );
}
