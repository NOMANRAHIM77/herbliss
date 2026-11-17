import "server-only";

import nodemailer from "nodemailer";
import { site } from "@/content/site";
import type { SmtpEnv } from "./env-schema";

export function createMailTransport(env: SmtpEnv) {
  const secure = env.SMTP_PORT === 465 || env.SMTP_PORT === 2465;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2" },
    auth: {
      user: env.SMTP_USER,
      pass:
        env.SMTP_HOST.toLowerCase() === "smtp.gmail.com"
          ? env.SMTP_PASS.replace(/\s/g, "")
          : env.SMTP_PASS,
    },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
  });
}

/** A fixed verification template; callers cannot choose the sender or email body. */
export async function sendVerificationCodeViaSmtp(
  env: SmtpEnv,
  email: string,
  code: string,
): Promise<void> {
  const transporter = createMailTransport(env);
  try {
    const result = await transporter.sendMail({
      from: { name: site.name, address: env.EMAIL_FROM },
      to: { name: "", address: email },
      replyTo: env.STORE_CONTACT_EMAIL,
      subject: `Verify your email for ${site.name}`,
      text: [
        `Your ${site.name} verification code is ${code}.`,
        "Enter this code on the verification page to finish creating your account.",
        "The code expires shortly and can only be used once.",
        "If you didn't request an account, you can ignore this message.",
      ].join("\n\n"),
    });
    if (!result.accepted.length) throw new Error("No recipient accepted.");
  } catch (error) {
    // Provider errors can contain addresses, credentials or raw SMTP responses.
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined;
    const knownCodes = [
      "EAUTH",
      "ETIMEDOUT",
      "ECONNECTION",
      "ESOCKET",
      "EDNS",
      "EENVELOPE",
      "EMESSAGE",
      "ETLS",
    ];
    console.error("[email] smtp_delivery_failed", {
      code:
        typeof code === "string" && knownCodes.includes(code)
          ? code
          : "UNKNOWN",
    });
    throw new Error("Could not send the verification email.");
  } finally {
    transporter.close();
  }
}
