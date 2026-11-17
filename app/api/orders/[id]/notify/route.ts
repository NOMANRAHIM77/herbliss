import { currentCustomer } from "@/lib/auth";
import { isAllowedAuthOrigin } from "@/lib/auth-origin";
import { checkoutWhatsAppUrl } from "@/lib/checkout-whatsapp";
import { getEnv } from "@/lib/env";
import { orderRecords } from "@/lib/orders";

export const runtime = "nodejs";
function json(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

/** Compatibility endpoint for retrieving a draft for an existing saved order. */
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
        { error: "Log in to view your order.", retryable: false },
        401,
      );
    const { id } = await params;
    if (!/^[a-f0-9]{64}$/.test(id))
      return json({ error: "Order request not found.", retryable: false }, 404);
    const orders = await orderRecords();
    const order = await orders.findOne(
      { _id: id, "customer.email": customer.email },
      { projection: { "receipt.bytes": 0 } },
    );
    if (!order)
      return json({ error: "Order request not found.", retryable: false }, 404);
    return json({ whatsappUrl: checkoutWhatsAppUrl(order) });
  } catch {
    return json(
      {
        error: "Your order is saved. Please try opening WhatsApp again.",
        retryable: true,
      },
      503,
    );
  }
}
