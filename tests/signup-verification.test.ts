import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  env: {
    ENABLE_EMAIL: true,
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    JWT_SECRET: "a-fixture-secret-used-only-in-tests",
  },
  mail: vi.fn(),
  createSession: vi.fn(),
  customers: { findOne: vi.fn(), insertOne: vi.fn() },
  pending: {
    createIndex: vi.fn(),
    deleteOne: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ getEnv: () => state.env }));
vi.mock("@/lib/mail", () => ({ sendVerificationCode: state.mail }));
vi.mock("@/lib/auth", () => ({
  authCollections: async () => ({
    customers: state.customers,
    pendingSignups: state.pending,
  }),
  createSession: state.createSession,
  customerId: () => "a".repeat(64),
  endSession: vi.fn(),
  hashPassword: async () => "hashed-test-password",
  limitAuth: async () => true,
  verifyPassword: vi.fn(),
}));

import { POST } from "@/app/api/auth/[action]/route";
import { isAllowedAuthOrigin } from "@/lib/auth-origin";

const signup = {
  name: "Test Customer",
  email: "customer@example.test",
  phone: "03001234567",
  password: "test-password-only",
};

function authRequest(action: string, body: unknown) {
  const request = new Request("http://127.0.0.1:3000/api/auth/" + action, {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ action }) });
}

describe("auth request origins", () => {
  it("allows the two local aliases on the same dev port only", () => {
    const requestWithOrigin = (origin: string) =>
      new Request("http://localhost:3000/api/auth/signup", {
        headers: { Origin: origin },
      });

    for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000"]) {
      expect(
        isAllowedAuthOrigin(
          requestWithOrigin(origin),
          state.env.NEXT_PUBLIC_APP_URL,
          true,
        ),
      ).toBe(true);
    }
    for (const origin of [
      "https://example.test",
      "http://127.0.0.1:4000",
      "null",
    ]) {
      expect(
        isAllowedAuthOrigin(
          requestWithOrigin(origin),
          state.env.NEXT_PUBLIC_APP_URL,
          true,
        ),
      ).toBe(false);
    }
    expect(
      isAllowedAuthOrigin(
        requestWithOrigin("http://127.0.0.1:3000"),
        "https://herbliss.example.test",
        false,
      ),
    ).toBe(false);
  });
});

describe("email verification on signup", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    state.env.ENABLE_EMAIL = true;
    state.customers.findOne.mockResolvedValue(null);
    state.mail.mockResolvedValue(undefined);
    state.pending.deleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  it("requires the email code before creating a customer and a session", async () => {
    const started = await authRequest("signup", signup);
    expect(started.status).toBe(200);
    const { verificationId } = await started.json();
    const { $set: pending } = state.pending.updateOne.mock.calls[0][1];
    const [recipient, code] = state.mail.mock.calls[0];
    expect(recipient).toBe(signup.email);
    expect(code).toMatch(/^\d{6}$/);
    expect(pending.codeHash).not.toBe(code);
    expect(pending.passwordHash).not.toBe(signup.password);
    expect(state.customers.insertOne).not.toHaveBeenCalled();
    expect(state.createSession).not.toHaveBeenCalled();

    state.pending.findOneAndDelete.mockResolvedValueOnce(null);
    const wrongCode = code === "012345" ? "678901" : "012345";
    const wrong = await authRequest("verify", {
      verificationId,
      code: wrongCode,
    });
    expect(wrong.status).toBe(400);
    expect(state.customers.insertOne).not.toHaveBeenCalled();
    expect(state.pending.updateOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ attemptsRemaining: { $gt: 0 } }),
      { $inc: { attemptsRemaining: -1 } },
    );

    state.pending.findOneAndDelete.mockImplementationOnce(async (filter) =>
      filter.codeHash === pending.codeHash
        ? { ...pending, _id: filter._id }
        : null,
    );
    const verified = await authRequest("verify", { verificationId, code });
    expect(verified.status).toBe(200);
    expect(state.pending.findOneAndDelete).toHaveBeenLastCalledWith(
      expect.objectContaining({
        codeHash: pending.codeHash,
        expiresAt: { $gt: expect.any(Date) },
        attemptsRemaining: { $gt: 0 },
      }),
    );
    expect(state.customers.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        email: signup.email,
        emailVerifiedAt: expect.any(Date),
      }),
    );
    expect(state.createSession).toHaveBeenCalledOnce();
    state.pending.findOneAndDelete.mockResolvedValueOnce(null);
    const replay = await authRequest("verify", { verificationId, code });
    expect(replay.status).toBe(400);
    expect(state.createSession).toHaveBeenCalledOnce();
  });

  it("enforces resend cooldown and replaces the previous code", async () => {
    const started = await authRequest("signup", signup);
    const { verificationId } = await started.json();
    const { $set: pending } = state.pending.updateOne.mock.calls[0][1];
    const firstCode = state.mail.mock.calls[0][1];
    state.pending.findOne.mockResolvedValueOnce(pending);

    const tooSoon = await authRequest("resend", { verificationId });
    expect(tooSoon.status).toBe(429);
    expect(state.mail).toHaveBeenCalledOnce();

    const ready = { ...pending, resendAfter: new Date(0) };
    state.pending.findOne.mockResolvedValueOnce(ready);
    state.pending.findOneAndUpdate.mockResolvedValueOnce(ready);
    const resent = await authRequest("resend", { verificationId });
    expect(resent.status).toBe(200);
    expect(state.mail).toHaveBeenCalledTimes(2);
    expect(state.mail.mock.calls[1][1]).not.toBe(firstCode);
  });

  it("leaves no account or session when SMTP rejects delivery", async () => {
    state.mail.mockRejectedValueOnce(new Error("test SMTP rejection"));
    const response = await authRequest("signup", signup);
    expect(response.status).toBe(503);
    expect(state.pending.deleteOne).toHaveBeenCalledOnce();
    expect(state.customers.insertOne).not.toHaveBeenCalled();
    expect(state.createSession).not.toHaveBeenCalled();
  });

  it("does not bypass verification while email is disabled", async () => {
    state.env.ENABLE_EMAIL = false;
    const response = await authRequest("signup", signup);
    expect(response.status).toBe(503);
    expect(state.mail).not.toHaveBeenCalled();
    expect(state.customers.insertOne).not.toHaveBeenCalled();
    expect(state.createSession).not.toHaveBeenCalled();
  });
});
