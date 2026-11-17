import "server-only";
import { site } from "@/content/site";
import { getEnv } from "@/lib/env";
import type { OrderRecord } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export function checkoutWhatsAppConfig() {
  const env = getEnv();
  const recipient =
    process.env.NODE_ENV === "development"
      ? env.CHECKOUT_WHATSAPP_TEST_NUMBER
      : site.contact.whatsapp;
  if (!recipient || !env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID)
    return null;
  return {
    recipient,
    authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
    endpoint: `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}`,
  };
}

type SendResult =
  | { state: "accepted"; messageId: string }
  | { state: "rejected" }
  | { state: "uncertain" };

export async function sendCheckoutWhatsApp(
  config: NonNullable<ReturnType<typeof checkoutWhatsAppConfig>>,
  order: OrderRecord,
): Promise<SendResult> {
  const { customer, receipt } = order;
  const parameters = [
    order.reference,
    order.lines
      .map(
        ({ name, quantity, unitPaisa }) =>
          `${name} × ${quantity} (${formatPrice(unitPaisa * quantity)})`,
      )
      .join("; "),
    formatPrice(order.subtotal),
    order.delivery ? formatPrice(order.delivery) : "Free",
    formatPrice(order.total),
    customer.name,
    customer.phone,
    customer.email,
    `${customer.address}, ${customer.city}, Pakistan`,
  ].map((value) => ({ type: "text", text: value.replace(/\s+/g, " ").trim() }));

  let mediaId: string | undefined;
  if (order.method === "easypaisa-manual") {
    if (!receipt) return { state: "rejected" };
    const form = new FormData();
    form.set("messaging_product", "whatsapp");
    form.set("type", receipt.mimeType);
    form.set(
      "file",
      new Blob([Uint8Array.from(receipt.bytes.value())], {
        type: receipt.mimeType,
      }),
      receipt.mimeType === "image/png" ? "easypaisa.png" : "easypaisa.jpg",
    );
    try {
      const upload = await fetch(config.endpoint + "/media", {
        method: "POST",
        headers: { Authorization: config.authorization },
        body: form,
        signal: AbortSignal.timeout(15_000),
        redirect: "error",
      });
      const payload = await upload.json().catch(() => null);
      if (!upload.ok || typeof payload?.id !== "string" || !payload.id) {
        console.warn(
          "WhatsApp checkout screenshot upload failed.",
          upload.status,
        );
        return { state: "rejected" };
      }
      mediaId = payload.id;
    } catch {
      return { state: "rejected" };
    }
  }

  try {
    const response = await fetch(config.endpoint + "/messages", {
      method: "POST",
      headers: {
        Authorization: config.authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: config.recipient,
        type: "template",
        template: {
          name: mediaId ? "herbliss_order_easypaisa" : "herbliss_order_cod",
          language: { code: "en_US" },
          components: [
            ...(mediaId
              ? [
                  {
                    type: "header",
                    parameters: [{ type: "image", image: { id: mediaId } }],
                  },
                ]
              : []),
            { type: "body", parameters },
          ],
        },
      }),
      signal: AbortSignal.timeout(15_000),
      redirect: "error",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      console.warn("WhatsApp checkout message failed.", response.status);
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 408
      )
        return { state: "rejected" };
      return { state: "uncertain" };
    }
    const messageId = payload?.messages?.[0]?.id;
    if (typeof messageId === "string" && messageId)
      return { state: "accepted", messageId };
  } catch {
    // The request may have reached Meta before the connection failed.
  }
  return { state: "uncertain" };
}
