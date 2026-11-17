import { currentCustomer, limitAuth } from "@/lib/auth";
import { isAllowedAuthOrigin } from "@/lib/auth-origin";
import {
  checkoutWhatsAppConfig,
  sendCheckoutWhatsApp,
} from "@/lib/checkout-whatsapp";
import { getEnv } from "@/lib/env";
import { orderRecords, type OrderRecord } from "@/lib/orders";

export const runtime = "nodejs";

function json(
  body: { accepted: true } | { error: string; retryable: boolean },
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function priorAttempt(notification: OrderRecord["whatsappNotification"]) {
  if (notification?.state === "accepted") return json({ accepted: true });
  if (
    notification?.state === "sending" &&
    Date.now() - notification.startedAt.getTime() < 60_000
  )
    return json(
      {
        error:
          "Your order notification is in progress. Check again in a moment.",
        retryable: true,
      },
      409,
    );
  return json(
    {
      error:
        "We couldn’t confirm the WhatsApp notification. Contact Herbliss with your order reference.",
      retryable: false,
    },
    503,
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (
    !isAllowedAuthOrigin(
      request,
      getEnv().NEXT_PUBLIC_APP_URL,
      process.env.NODE_ENV === "development",
    )
  )
    return json({ error: "Request not allowed.", retryable: false }, 403);

  try {
    const customer = await currentCustomer();
    if (!customer)
      return json(
        {
          error: "Log in to notify Herbliss about your order.",
          retryable: false,
        },
        401,
      );

    const { id } = await params;
    const notFound = () =>
      json({ error: "Order request not found.", retryable: false }, 404);
    if (!/^[a-f0-9]{64}$/.test(id)) return notFound();
    const orders = await orderRecords();
    const owner = { _id: id, "customer.email": customer.email };
    const projection = { whatsappNotification: 1 };
    const saved = await orders.findOne(owner, { projection });
    if (!saved) return notFound();
    if (saved.whatsappNotification)
      return priorAttempt(saved.whatsappNotification);

    const config = checkoutWhatsAppConfig();
    if (!config)
      return json(
        {
          error:
            "Automatic WhatsApp notifications are unavailable. Contact Herbliss with your order reference.",
          retryable: false,
        },
        503,
      );
    if (!(await limitAuth("checkout-notification:" + customer.email)))
      return json(
        { error: "Please try again in 15 minutes.", retryable: true },
        429,
      );

    // Only the request that claims this saved order may send it.
    const order = await orders.findOneAndUpdate(
      { ...owner, whatsappNotification: { $exists: false } },
      {
        $set: {
          whatsappNotification: { state: "sending", startedAt: new Date() },
        },
      },
      { returnDocument: "after" },
    );
    if (!order) {
      const latest = await orders.findOne(owner, { projection });
      if (!latest) return notFound();
      if (latest.whatsappNotification)
        return priorAttempt(latest.whatsappNotification);
      return json(
        {
          error: "Your order is saved. Try sending the notification again.",
          retryable: true,
        },
        409,
      );
    }

    const result = await sendCheckoutWhatsApp(config, order);
    if (result.state === "rejected") {
      await orders.updateOne(owner, { $unset: { whatsappNotification: "" } });
      return json(
        {
          error:
            "WhatsApp could not accept the notification. Please try again.",
          retryable: true,
        },
        502,
      );
    }
    await orders.updateOne(owner, { $set: { whatsappNotification: result } });
    return priorAttempt(result);
  } catch {
    return json(
      {
        error: "Your order is saved. Check the notification again in a moment.",
        retryable: true,
      },
      503,
    );
  }
}
