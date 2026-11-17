import { site } from "@/content/site";

export const maxReceiptBytes = 3 * 1024 * 1024;
export const receiptMimeTypes = ["image/jpeg", "image/png"] as const;
export type ReceiptMimeType = (typeof receiptMimeTypes)[number];
export type PaymentMethod = (typeof site.payments.methods)[number];

export type CheckoutCustomer = { name: string; email: string; phone: string };
export type CheckoutResult = {
  id: string;
  reference: string;
  receiptPath: string | null;
  notificationAvailable: boolean;
};
