import "server-only";
import { cookies } from "next/headers";
import type { CheckoutCustomer } from "@/lib/checkout";
import { parseStorefrontEnv } from "@/lib/env-schema";
import { sessionCookie } from "@/lib/session-cookie";

export async function storefrontCustomer(): Promise<CheckoutCustomer | null> {
  const { BACKEND_URL } = parseStorefrontEnv(process.env);
  if (!BACKEND_URL) {
    const { currentCustomer } = await import("@/lib/auth");
    return currentCustomer();
  }

  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
    cache: "no-store",
    headers: { Cookie: `${sessionCookie}=${token}` },
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("The account service is unavailable.");
  return (await response.json()).customer;
}
