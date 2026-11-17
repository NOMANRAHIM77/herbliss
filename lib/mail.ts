import "server-only";

import { getEnv } from "./env";
import { parseSmtpEnv } from "./env-schema";
import { createMailTransport, sendVerificationCodeViaSmtp } from "./smtp";

export class MailConfigurationError extends Error {
  constructor() {
    super(
      "Email delivery is disabled or incomplete. Check the email settings.",
    );
    this.name = "MailConfigurationError";
  }
}

export async function sendVerificationCode(
  email: string,
  code: string,
): Promise<void> {
  const env = getEnv();
  if (!env.ENABLE_EMAIL) throw new MailConfigurationError();

  if (env.EMAIL_DELIVERY === "relay") {
    if (!env.EMAIL_RELAY_SECRET) throw new MailConfigurationError();
    try {
      const response = await fetch(
        new URL("/internal/email-verification", env.NEXT_PUBLIC_APP_URL),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.EMAIL_RELAY_SECRET}`,
          },
          body: JSON.stringify({ email, code }),
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(40_000),
        },
      );
      if (!response.ok || (await response.json()).sent !== true) {
        throw new Error("Email relay failed.");
      }
      return;
    } catch {
      // Never surface the relay secret, recipient, code or upstream response.
      throw new Error("Could not send the verification email.");
    }
  }

  await sendVerificationCodeViaSmtp(parseSmtpEnv(process.env), email, code);
}

/** Test SMTP connectivity and authentication without delivering a message. */
export async function verifySmtpConnection(): Promise<void> {
  const env = getEnv();
  if (!env.ENABLE_EMAIL || env.EMAIL_DELIVERY === "relay") {
    throw new MailConfigurationError();
  }
  const transporter = createMailTransport(parseSmtpEnv(process.env));
  try {
    await transporter.verify();
  } finally {
    transporter.close();
  }
}
