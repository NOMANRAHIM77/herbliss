import { z } from "zod";
import {
  authCollections,
  createSession,
  customerId,
  endSession,
  limitAuth,
  verifyPassword,
} from "@/lib/auth";
import { isAllowedAuthOrigin } from "@/lib/auth-origin";
import { getEnv } from "@/lib/env";
import {
  resendSignupCode,
  SignupVerificationError,
  startSignup,
  verifySignupCode,
} from "@/lib/signup-verification";

export const runtime = "nodejs";
const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});
const registration = credentials.extend({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+92|0092|92|0)3\d{9}$/,
      "Enter a valid Pakistani mobile number.",
    ),
});
const verification = z.object({
  verificationId: z.string().regex(/^[a-f0-9]{64}\.[a-f0-9]{32}$/),
});
const codeSubmission = verification.extend({
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code."),
});

function json(
  body: { ok: true; verificationId?: string } | { error: string },
  status = 200,
  retryAfter?: number,
) {
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return Response.json(body, { status, headers });
}

function invalidInput(error: z.ZodError) {
  return json({ error: error.issues[0]?.message ?? "Invalid request." }, 400);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  if (
    !isAllowedAuthOrigin(
      request,
      getEnv().NEXT_PUBLIC_APP_URL,
      process.env.NODE_ENV === "development",
    )
  )
    return json({ error: "Request not allowed." }, 403);
  const { action } = await context.params;
  if (!["signup", "verify", "resend", "login", "logout"].includes(action))
    return json({ error: "Not found." }, 404);
  try {
    if (action === "logout") {
      await endSession();
      return json({ ok: true });
    }
    if (!request.headers.get("content-type")?.includes("application/json"))
      return json({ error: "JSON required." }, 415);
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: "Request is too large." }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid request." }, 400);
    }
    if (action === "signup") {
      const parsed = registration.safeParse(body);
      if (!parsed.success) return invalidInput(parsed.error);
      const verificationId = await startSignup(parsed.data);
      return json({ ok: true, verificationId });
    }
    if (action === "resend") {
      const parsed = verification.safeParse(body);
      if (!parsed.success) return invalidInput(parsed.error);
      await resendSignupCode(parsed.data.verificationId);
      return json({ ok: true });
    }
    if (action === "verify") {
      const parsed = codeSubmission.safeParse(body);
      if (!parsed.success) return invalidInput(parsed.error);
      const id = await verifySignupCode(
        parsed.data.verificationId,
        parsed.data.code,
      );
      await createSession(id);
      return json({ ok: true });
    }

    const parsed = credentials.safeParse(body);
    if (!parsed.success) return invalidInput(parsed.error);
    const { email, password } = parsed.data;
    if (!(await limitAuth(email)))
      return json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        429,
        900,
      );
    const { customers } = await authCollections();
    const id = customerId(email);
    const customer = await customers.findOne({ _id: id });
    // Do equivalent password derivation even for an unknown email.
    const valid = await verifyPassword(
      password,
      customer?.passwordHash ??
        "00000000000000000000000000000000:" + "00".repeat(64),
    );
    if (!customer || !valid)
      return json({ error: "Email or password is incorrect." }, 401);
    await createSession(id);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof SignupVerificationError) {
      return json({ error: error.message }, error.status, error.retryAfter);
    }
    return json(
      {
        error: "Account service is temporarily unavailable. Please try again.",
      },
      503,
    );
  }
}
