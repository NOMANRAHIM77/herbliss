import { orderRecords, receiptLifetime, validReceiptKey } from "@/lib/orders";

export const runtime = "nodejs";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const key = new URL(request.url).searchParams.get("key");
  const notFound = () =>
    new Response(null, { status: 404, headers: privateHeaders });
  if (!validReceiptKey(id, key)) return notFound();

  try {
    const orders = await orderRecords();
    const order = await orders.findOne(
      { _id: id, createdAt: { $gt: new Date(Date.now() - receiptLifetime) } },
      { projection: { receipt: 1 } },
    );
    if (!order?.receipt) return notFound();

    const { bytes, mimeType } = order.receipt;
    const extension = mimeType === "image/png" ? "png" : "jpg";
    return new Response(Uint8Array.from(bytes.value()), {
      headers: {
        ...privateHeaders,
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="Herbliss-${id.slice(0, 12).toUpperCase()}.${extension}"`,
      },
    });
  } catch {
    return new Response(null, { status: 503, headers: privateHeaders });
  }
}
