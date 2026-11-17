import { currentCustomer } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const customer = await currentCustomer();
    if (!customer)
      return Response.json({ customer: null }, { headers, status: 401 });
    const { name, email, phone } = customer;
    return Response.json({ customer: { name, email, phone } }, { headers });
  } catch {
    return Response.json(
      { error: "The account service is unavailable." },
      { headers, status: 503 },
    );
  }
}
