import "server-only";
import { site } from "@/content/site";
import { getEnv } from "@/lib/env";
import { receiptPath, type OrderRecord } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

/** Build a draft from persisted prices and details, never client-supplied totals. */
export function checkoutWhatsAppUrl(order: OrderRecord): string {
  const env = getEnv();
  const recipient =
    process.env.NODE_ENV === "development"
      ? env.CHECKOUT_WHATSAPP_TEST_NUMBER || site.contact.whatsapp
      : site.contact.whatsapp;
  const clean = (value: string) => value.replace(/\s+/g, " ").trim();
  const message = [
    `Hello ${site.name}, I would like to confirm my order.`,
    `Order reference: ${order.reference}`,
    `Order date: ${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium" }).format(order.createdAt)}`,
    "",
    "Products:",
    ...order.lines.map(
      ({ name, quantity, unitPaisa }) =>
        `• ${clean(name)} × ${quantity} — ${formatPrice(unitPaisa)} each; ${formatPrice(unitPaisa * quantity)}`,
    ),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${order.delivery ? formatPrice(order.delivery) : "Free"}`,
    `Total: ${formatPrice(order.total)}`,
    `Payment: ${order.method === "cod" ? "Cash on delivery" : "Manual Easypaisa transfer — pending verification"}`,
    "",
    `Customer: ${clean(order.customer.name)}`,
    `Phone: ${clean(order.customer.phone)}`,
    `Email: ${clean(order.customer.email)}`,
    `Address: ${clean(order.customer.address)}, ${clean(order.customer.city)}, Pakistan`,
    ...(order.receipt
      ? [
          "",
          `Payment screenshot (link valid for 7 days from order creation): ${new URL(receiptPath(order._id), env.NEXT_PUBLIC_APP_URL).href}`,
        ]
      : []),
    "",
    "Please confirm availability and delivery. Payment and amounts should be checked against the saved order reference.",
  ].join("\n");
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}
