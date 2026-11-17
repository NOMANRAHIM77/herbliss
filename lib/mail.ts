import "server-only";

import nodemailer from "nodemailer";
import { site } from "@/content/site";
import { getEnv } from "./env";

export class MailConfigurationError extends Error {
  constructor() {
    super(
      "Email delivery is disabled. Enable and configure SMTP in .env.local.",
    );
    this.name = "MailConfigurationError";
  }
}

function createMailTransport() {
  const env = getEnv();
  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT;
  const user = env.SMTP_USER;
  const password = env.SMTP_PASS;
  const from = env.EMAIL_FROM;

  if (!env.ENABLE_EMAIL || !host || !port || !user || !password || !from) {
    throw new MailConfigurationError();
  }

  const secure = port === 465 || port === 2465;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2" },
    auth: {
      user,
      pass:
        host.toLowerCase() === "smtp.gmail.com"
          ? password.replace(/\s/g, "")
          : password,
    },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
  });

  return { transporter, from, replyTo: env.STORE_CONTACT_EMAIL };
}

export async function sendVerificationCode(
  email: string,
  code: string,
): Promise<void> {
  const { transporter, from, replyTo } = createMailTransport();

  try {
    const result = await transporter.sendMail({
      from: { name: site.name, address: from },
      to: { name: "", address: email },
      replyTo,
      subject: `Verify your email for ${site.name}`,
      text: [
        `Your ${site.name} verification code is ${code}.`,
        "Enter this code on the verification page to finish creating your account.",
        "The code expires shortly and can only be used once.",
        "If you didn't request an account, you can ignore this message.",
      ].join("\n\n"),
    });

    if (!result.accepted.length) throw new Error("No recipient accepted.");
  } catch {
    // Provider errors can contain recipient addresses or raw SMTP responses.
    throw new Error("Could not send the verification email.");
  }
}

/** Test SMTP connectivity and authentication without delivering a message. */
export async function verifySmtpConnection(): Promise<void> {
  const { transporter } = createMailTransport();
  await transporter.verify();
}
