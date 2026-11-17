import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { parseSmtpEnv } from "@/lib/env-schema";
import { sendVerificationCodeViaSmtp } from "@/lib/smtp";

export const runtime = "nodejs";
export const maxDuration = 60;

const payloadSchema = z.strictObject({
  email: z.email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

function reply(body: object, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  // This endpoint belongs to the storefront and bypasses the /api/* rewrite.
  if (!process.env.BACKEND_URL || process.env.RENDER === "true") {
    return reply({ error: "Not found." }, 404);
  }
  const secret = process.env.EMAIL_RELAY_SECRET;
  if (!secret || secret.length < 32) {
    return reply({ error: "Email delivery is not configured." }, 503);
  }
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (
    !timingSafeEqual(
      digest(request.headers.get("authorization") ?? ""),
      digest(`Bearer ${secret}`),
    )
  ) {
    return reply({ error: "Unauthorized." }, 401);
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return reply({ error: "Expected JSON." }, 415);
  }

  // Bound the body even when Content-Length is absent or misleading.
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Invalid request." }, 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let payload: z.infer<typeof payloadSchema>;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2_048) {
        await reader.cancel();
        return reply({ error: "Request too large." }, 413);
      }
      chunks.push(value);
    }
    payload = payloadSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
  } catch {
    return reply({ error: "Invalid request." }, 400);
  } finally {
    reader.releaseLock();
  }

  try {
    await sendVerificationCodeViaSmtp(
      parseSmtpEnv(process.env),
      payload.email,
      payload.code,
    );
    return reply({ sent: true }, 200);
  } catch {
    return reply({ error: "Could not send the verification email." }, 503);
  }
}
