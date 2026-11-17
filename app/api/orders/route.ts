import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { currentCustomer, limitAuth } from "@/lib/auth";
import { isAllowedAuthOrigin } from "@/lib/auth-origin";
import { cartTotals } from "@/lib/cart";
import {
  maxReceiptBytes,
  type CheckoutResult,
  type ReceiptMimeType,
} from "@/lib/checkout";
import { site } from "@/content/site";
import { checkoutWhatsAppUrl } from "@/lib/checkout-whatsapp";
import { getEnv } from "@/lib/env";
import { orderRecords, receiptPath, type OrderRecord } from "@/lib/orders";

export const runtime = "nodejs";

const maxFormBytes = maxReceiptBytes + 32 * 1024;
const pngMagic = Buffer.from("89504e470d0a1a0a", "hex");
const jpegMagic = Buffer.from("ffd8ff", "hex");
const fields = z.object({
  requestId: z.uuid(),
  method: z.enum(site.payments.methods),
  name: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[^\r\n]+$/),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+92|0092|92|0)3\d{9}$/),
  city: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[^\r\n]+$/),
  address: z
    .string()
    .trim()
    .min(8)
    .max(240)
    .transform((value) => value.replace(/\s+/g, " ")),
  expectedTotal: z
    .string()
    .regex(/^\d{1,10}$/)
    .transform(Number),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(100),
});

class OrderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function json(body: CheckoutResult | { error: string }, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function readForm(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!request.body || !contentType?.startsWith("multipart/form-data;")) {
    throw new OrderError("Submit the checkout form again.", 415);
  }

  const large = new OrderError("The screenshot must be 3 MB or smaller.", 413);
  if (Number(request.headers.get("content-length")) > maxFormBytes) throw large;
  let size = 0;
  const bounded = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > maxFormBytes) throw large;
        controller.enqueue(chunk);
      },
    }),
  );
  try {
    return await new Response(bounded, {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    if (size > maxFormBytes) throw large;
    throw new OrderError(
      "The checkout form could not be read. Please try again.",
      400,
    );
  }
}

async function paymentReceipt(file: FormDataEntryValue | null) {
  const invalid = new OrderError(
    "Upload a JPG or PNG screenshot of your Easypaisa payment.",
    400,
  );
  if (!file || typeof file === "string" || !file.size) throw invalid;
  if (file.size > maxReceiptBytes) {
    throw new OrderError("The screenshot must be 3 MB or smaller.", 413);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType: ReceiptMimeType | null = bytes
    .subarray(0, pngMagic.length)
    .equals(pngMagic)
    ? "image/png"
    : bytes.subarray(0, jpegMagic.length).equals(jpegMagic)
      ? "image/jpeg"
      : null;
  if (!mimeType || mimeType !== file.type) throw invalid;
  return { mimeType, bytes };
}

export async function POST(request: Request) {
  const env = getEnv();
  if (
    !isAllowedAuthOrigin(
      request,
      env.NEXT_PUBLIC_APP_URL,
      process.env.NODE_ENV === "development",
    )
  ) {
    return json({ error: "Request not allowed." }, 403);
  }

  try {
    const customer = await currentCustomer();
    if (!customer) throw new OrderError("Log in to submit your order.", 401);

    const form = await readForm(request);
    let items: unknown;
    try {
      items = JSON.parse(String(form.get("items")));
    } catch {
      throw new OrderError(
        "Your cart could not be read. Return to your cart and try again.",
        400,
      );
    }
    const parsed = fields.safeParse({ ...Object.fromEntries(form), items });
    if (!parsed.success) {
      throw new OrderError("Check your delivery details and try again.", 400);
    }
    const data = parsed.data;
    const totals = cartTotals(data.items);
    if (
      totals.total !== data.expectedTotal ||
      totals.lines.length !== data.items.length ||
      totals.lines.some(
        (line, index) =>
          line.id !== data.items[index].id ||
          line.quantity !== data.items[index].quantity,
      )
    ) {
      throw new OrderError(
        "Your cart total or availability has changed. Review your cart before continuing.",
        409,
      );
    }
    const receipt =
      data.method === "easypaisa-manual"
        ? await paymentReceipt(form.get("receipt"))
        : null;
    const id = createHash("sha256")
      .update(customer.email + ":" + data.requestId)
      .digest("hex");
    const requestHash = createHash("sha256")
      .update(JSON.stringify(data))
      .update(receipt?.bytes ?? "")
      .digest("hex");
    const orders = await orderRecords();
    const projection = { "receipt.bytes": 0 };
    let saved = await orders.findOne({ _id: id }, { projection });
    if (!saved) {
      if (!(await limitAuth("checkout:" + customer.email))) {
        throw new OrderError(
          "Too many order attempts. Please try again in 15 minutes.",
          429,
        );
      }
      const order: OrderRecord = {
        _id: id,
        reference: "HL-" + id.slice(0, 12).toUpperCase(),
        requestHash,
        method: data.method,
        status: receipt ? "awaiting-payment-review" : "awaiting-confirmation",
        customer: {
          name: data.name,
          phone: data.phone,
          email: customer.email,
          city: data.city,
          address: data.address,
        },
        lines: totals.lines.map(({ id, product, quantity }) => ({
          id,
          name: product.name,
          quantity,
          unitPaisa: product.pricePaisa,
        })),
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        createdAt: new Date(),
        ...(receipt
          ? {
              receipt: {
                mimeType: receipt.mimeType,
                bytes: new mongoose.mongo.Binary(receipt.bytes),
              },
            }
          : {}),
      };
      try {
        await orders.insertOne(order);
        saved = order;
      } catch (error) {
        if (
          !(error instanceof mongoose.mongo.MongoServerError) ||
          error.code !== 11000
        )
          throw error;
        saved = await orders.findOne({ _id: id }, { projection });
      }
    }
    if (!saved) throw new Error("Order request not found after saving.");
    if (saved.requestHash !== requestHash) {
      throw new OrderError(
        "This order request has changed. Reload checkout and try again.",
        409,
      );
    }

    return json({
      id: saved._id,
      reference: saved.reference,
      receiptPath: saved.receipt ? receiptPath(saved._id) : null,
      whatsappUrl: checkoutWhatsAppUrl(saved),
    });
  } catch (error) {
    if (error instanceof OrderError)
      return json({ error: error.message }, error.status);
    return json(
      { error: "We couldn't save your order request. Please try again." },
      503,
    );
  }
}
