import { products } from "@/content/products";
import { site } from "@/content/site";
export type CartItem = { id: string; quantity: number };

export function cleanCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const items: CartItem[] = [];
  const used = new Map<string, number>();
  for (const entry of value.slice(0, 100)) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof entry.id !== "string" ||
      !Number.isSafeInteger(entry.quantity) ||
      entry.quantity <= 0
    )
      continue;
    const product = products.find((p) => p.id === entry.id);
    if (!product || items.some((p) => p.id === product.id)) continue;
    const components = product.bundleComponents ?? [
      { productId: product.id, quantity: 1 },
    ];
    const available = Math.min(
      ...components.map((part) => {
        const stock =
          products.find((p) => p.id === part.productId)?.initialStock ?? 0;
        return Math.floor(
          (stock - (used.get(part.productId) ?? 0)) / part.quantity,
        );
      }),
    );
    const quantity = Math.min(entry.quantity, available);
    if (quantity <= 0) continue;
    items.push({ id: product.id, quantity });
    for (const part of components)
      used.set(
        part.productId,
        (used.get(part.productId) ?? 0) + quantity * part.quantity,
      );
  }
  return items;
}

export function cartTotals(items: CartItem[]) {
  const lines = cleanCart(items).map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.id)!,
  }));
  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.pricePaisa * line.quantity,
    0,
  );
  const delivery =
    !lines.length || lines.some((line) => line.product.shippingIncluded)
      ? 0
      : site.shipping.feePaisa;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}
