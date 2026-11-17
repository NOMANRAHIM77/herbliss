import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type mongoose from "mongoose";
import type {
  CheckoutCustomer,
  PaymentMethod,
  ReceiptMimeType,
} from "@/lib/checkout";
import { connectDB } from "@/lib/db";
import { getEnv } from "@/lib/env";

export const receiptLifetime = 7 * 24 * 60 * 60 * 1000;

export type OrderRecord = {
  _id: string;
  reference: string;
  requestHash: string;
  method: PaymentMethod;
  status: "awaiting-confirmation" | "awaiting-payment-review";
  customer: CheckoutCustomer & { city: string; address: string };
  lines: { id: string; name: string; quantity: number; unitPaisa: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  createdAt: Date;
  receipt?: { mimeType: ReceiptMimeType; bytes: mongoose.mongo.Binary };
  whatsappNotification?:
    | { state: "sending"; startedAt: Date }
    | { state: "accepted"; messageId: string }
    | { state: "uncertain" };
};

export async function orderRecords() {
  const { connection } = await connectDB();
  if (!connection.db) throw new Error("Order storage is unavailable.");
  return connection.db.collection<OrderRecord>("checkout_orders");
}

function receiptKey(orderId: string) {
  return createHmac("sha256", getEnv().JWT_SECRET)
    .update("checkout-receipt:" + orderId)
    .digest("hex");
}

export function receiptPath(orderId: string) {
  return `/api/orders/receipt/${orderId}?key=${receiptKey(orderId)}`;
}

export function validReceiptKey(orderId: string, suppliedKey: string | null) {
  if (
    !/^[a-f0-9]{64}$/.test(orderId) ||
    !suppliedKey ||
    !/^[a-f0-9]{64}$/.test(suppliedKey)
  ) {
    return false;
  }
  return timingSafeEqual(
    Buffer.from(receiptKey(orderId), "hex"),
    Buffer.from(suppliedKey, "hex"),
  );
}
