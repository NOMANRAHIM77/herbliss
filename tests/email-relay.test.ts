import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const smtp = vi.hoisted(() => ({
  sendMail: vi.fn(),
  close: vi.fn(),
  verify: vi.fn(),
  createTransport: vi.fn(),
}));
const backend = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("server-only", () => ({}));
vi.mock("nodemailer", () => ({
  default: { createTransport: smtp.createTransport },
}));
vi.mock("@/lib/env", async () => {
  const { parseEnv } = await import("@/lib/env-schema");
  return { getEnv: () => parseEnv(backend.env) };
});

import { POST } from "@/app/internal/email-verification/route";
import { sendVerificationCode, verifySmtpConnection } from "@/lib/mail";

const secret = "relay-test-secret-with-at-least-thirty-two-characters";
const payload = { email: "customer@example.test", code: "012345" };
const smtpSettings = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "sender@example.test",
  SMTP_PASS: "abcd efgh ijkl mnop",
  EMAIL_FROM: "sender@example.test",
  STORE_CONTACT_EMAIL: "sender@example.test",
};

function request(body: unknown = payload, token = secret) {
  return new Request("https://shop.example.test/internal/email-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  backend.env = {
    NEXT_PUBLIC_APP_URL: "https://shop.example.test",
    MONGODB_URI: "mongodb://127.0.0.1:27017/test",
    JWT_SECRET: "backend-test-secret-with-at-least-thirty-two-characters",
    ENABLE_EMAIL: "true",
    EMAIL_DELIVERY: "relay",
    EMAIL_RELAY_SECRET: secret,
  };
  for (const [key, value] of Object.entries({
    ...smtpSettings,
    BACKEND_URL: "https://api.example.test",
    EMAIL_RELAY_SECRET: secret,
    RENDER: "",
    MONGODB_URI: "",
    JWT_SECRET: "",
  }))
    vi.stubEnv(key, value);
  smtp.createTransport.mockReturnValue(smtp);
  smtp.sendMail.mockResolvedValue({ accepted: [payload.email] });
  smtp.verify.mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe("verification email relay", () => {
  it("delivers from Render through the Vercel handler to Gmail without SMTP on Render", async () => {
    const relayFetch = vi.fn(async (url: URL, options: RequestInit) => {
      expect(url.href).toBe(
        "https://shop.example.test/internal/email-verification",
      );
      expect(options.redirect).toBe("error");
      expect(options.cache).toBe("no-store");
      return POST(new Request(url, options));
    });
    vi.stubGlobal("fetch", relayFetch);
    await sendVerificationCode(payload.email, payload.code);
    expect(relayFetch).toHaveBeenCalledTimes(1);
    expect(smtp.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: "The Herbliss", address: smtpSettings.EMAIL_FROM },
        to: { name: "", address: payload.email },
        text: expect.stringContaining(payload.code),
      }),
    );
    expect(smtp.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        secure: true,
        auth: { user: smtpSettings.SMTP_USER, pass: "abcdefghijklmnop" },
      }),
    );
    expect(smtp.close).toHaveBeenCalledTimes(1);
  });

  it.each(["", "wrong-secret"])(
    "rejects unauthorized requests before contacting SMTP",
    async (token) => {
      expect((await POST(request(payload, token))).status).toBe(401);
      expect(smtp.createTransport).not.toHaveBeenCalled();
    },
  );

  it("is unavailable without a secret, or on the Render backend", async () => {
    vi.stubEnv("EMAIL_RELAY_SECRET", "");
    expect((await POST(request())).status).toBe(503);
    vi.stubEnv("RENDER", "true");
    expect((await POST(request())).status).toBe(404);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it.each([
    { ...payload, email: "victim@example.test,other@example.test" },
    { ...payload, code: "12345" },
    { ...payload, code: "123456\nCustom content" },
    { ...payload, subject: "Arbitrary content" },
  ])(
    "rejects invalid recipients, codes and arbitrary mail fields",
    async (body) => {
      expect((await POST(request(body))).status).toBe(400);
      expect(smtp.sendMail).not.toHaveBeenCalled();
    },
  );

  it("rejects oversized bodies without relying on Content-Length", async () => {
    expect(
      (await POST(request({ ...payload, extra: "x".repeat(3_000) }))).status,
    ).toBe(413);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it("does not report delivery or expose provider details when Gmail fails", async () => {
    smtp.sendMail.mockRejectedValue(
      Object.assign(new Error("private-provider-error"), {
        code: "EAUTH",
        response: "private-provider-response",
      }),
    );
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).not.toContain("private-provider-error");
    expect(console.error).toHaveBeenCalledWith("[email] smtp_delivery_failed", {
      code: "EAUTH",
    });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(
      /private-provider|customer@example|012345/,
    );
    expect(smtp.close).toHaveBeenCalledTimes(1);
  });

  it("fails cleanly for missing SMTP settings or rejected recipients", async () => {
    vi.stubEnv("SMTP_PASS", "");
    expect((await POST(request())).status).toBe(503);
    expect(console.error).toHaveBeenCalledWith(
      "[email] smtp_configuration_invalid",
      { keys: ["SMTP_PASS"] },
    );
    expect(smtp.sendMail).not.toHaveBeenCalled();
    vi.stubEnv("SMTP_PASS", smtpSettings.SMTP_PASS);
    smtp.sendMail.mockResolvedValue({ accepted: [] });
    expect((await POST(request())).status).toBe(503);
  });

  it.each([
    () => Response.json({ error: "Unauthorized" }, { status: 401 }),
    () => Response.json({ sent: false }),
    () => new Response("<html>Deployment protection</html>"),
    () => {
      throw new Error("private-network-error");
    },
  ])(
    "propagates relay failure to signup without leaking upstream data",
    async (response) => {
      vi.stubGlobal("fetch", vi.fn(response));
      await expect(
        sendVerificationCode(payload.email, payload.code),
      ).rejects.toThrow("Could not send the verification email.");
      expect(smtp.sendMail).not.toHaveBeenCalled();
    },
  );

  it("preserves direct SMTP for local development and the connection-only check", async () => {
    backend.env = { ...backend.env, ...smtpSettings, EMAIL_DELIVERY: "smtp" };
    await sendVerificationCode(payload.email, payload.code);
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
    await verifySmtpConnection();
    expect(smtp.verify).toHaveBeenCalledTimes(1);
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
  });

  it("does not send when email is disabled", async () => {
    backend.env.ENABLE_EMAIL = "false";
    await expect(
      sendVerificationCode(payload.email, payload.code),
    ).rejects.toThrow(/disabled/);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
});
