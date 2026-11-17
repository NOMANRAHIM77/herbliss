import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderRecord } from "@/lib/orders";

const state = vi.hoisted(() => ({
  records: new Map<string, OrderRecord>(),
  env: {
    NEXT_PUBLIC_APP_URL: "https://shop.example.test",
    JWT_SECRET: "a-test-only-secret-for-checkout-receipts",
    CHECKOUT_WHATSAPP_TEST_NUMBER: undefined as string | undefined,
    WHATSAPP_PHONE_NUMBER_ID: undefined as string | undefined,
    WHATSAPP_ACCESS_TOKEN: undefined as string | undefined,
    WHATSAPP_GRAPH_VERSION: "v27.0",
  },
  customer: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ getEnv: () => state.env }));
vi.mock("@/lib/auth", () => ({
  currentCustomer: state.customer,
  limitAuth: async () => true,
}));
vi.mock("@/lib/db", () => ({
  connectDB: async () => ({
    connection: {
      db: {
        collection: () => ({
          findOne: async (filter: {
            _id: string;
            createdAt?: { $gt: Date };
            "customer.email"?: string;
          }) => {
            const record = state.records.get(filter._id);
            if (
              record &&
              (!filter["customer.email"] ||
                record.customer.email === filter["customer.email"]) &&
              (!filter.createdAt || record.createdAt > filter.createdAt.$gt)
            )
              return record;
            return null;
          },
          insertOne: async (order: OrderRecord) => {
            if (state.records.has(order._id))
              throw new Error("Duplicate request");
            state.records.set(order._id, order);
          },
          findOneAndUpdate: async (
            filter: { _id: string; "customer.email": string },
            update: {
              $set: {
                whatsappNotification: OrderRecord["whatsappNotification"];
              };
            },
          ) => {
            const order = state.records.get(filter._id);
            if (
              !order ||
              order.customer.email !== filter["customer.email"] ||
              order.whatsappNotification
            )
              return null;
            order.whatsappNotification = update.$set.whatsappNotification;
            return order;
          },
          updateOne: async (
            filter: { _id: string },
            update: {
              $set?: {
                whatsappNotification: OrderRecord["whatsappNotification"];
              };
              $unset?: { whatsappNotification: string };
            },
          ) => {
            const order = state.records.get(filter._id);
            if (order)
              order.whatsappNotification = update.$set?.whatsappNotification;
          },
        }),
      },
    },
  }),
}));

import { POST } from "@/app/api/orders/route";
import { POST as notifyOrder } from "@/app/api/orders/[id]/notify/route";
import { GET as downloadReceipt } from "@/app/api/orders/receipt/[id]/route";
import { site } from "@/content/site";
import type { CheckoutResult } from "@/lib/checkout";

const origin = "http://127.0.0.1:3000";
const screenshot = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGNgAAIAAAUAAYoz3MkAAAAASUVORK5CYII=",
  "base64",
);

function submit(
  method: "cod" | "easypaisa-manual",
  receipt?: File,
  total = 234000,
) {
  const body = new FormData();
  Object.entries({
    requestId: "e00f7dbd-13ea-4ccb-b536-932b64dfaa7a",
    method,
    name: "Sample Customer",
    phone: "03001234567",
    city: "Karachi",
    address: "Sample street 5, test neighborhood",
    expectedTotal: String(total),
    items: JSON.stringify([
      { id: "preview-body-lotion", quantity: 1 },
      { id: "preview-duo", quantity: 1 },
    ]),
  }).forEach(([key, value]) => body.set(key, value));
  if (receipt) body.set("receipt", receipt);
  return POST(
    new Request(origin + "/api/orders", {
      method: "POST",
      headers: { Origin: origin },
      body,
    }),
  );
}

function notify(id: string) {
  const request = new Request(origin + "/api/orders/" + id + "/notify", {
    method: "POST",
    headers: { Origin: origin },
  });
  return notifyOrder(request, { params: Promise.resolve({ id }) });
}

describe("WhatsApp checkout", () => {
  beforeEach(() => {
    state.records.clear();
    state.env.NEXT_PUBLIC_APP_URL = "https://shop.example.test";
    state.env.CHECKOUT_WHATSAPP_TEST_NUMBER = undefined;
    state.env.WHATSAPP_PHONE_NUMBER_ID = undefined;
    state.env.WHATSAPP_ACCESS_TOKEN = undefined;
    state.customer.mockResolvedValue({ email: "sample@example.test" });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("saves a COD order once and builds a WhatsApp draft without Meta credentials", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    const first = await submit("cod");
    expect(first.status).toBe(200);
    const result: CheckoutResult = await first.json();
    await expect((await submit("cod")).json()).resolves.toEqual(result);
    expect(state.records.size).toBe(1);
    expect(result.receiptPath).toBeNull();
    expect(new URL(result.whatsappUrl).hostname).toBe("wa.me");
    const text = new URL(result.whatsappUrl).searchParams.get("text")!;
    for (const detail of [
      result.reference,
      "Cash on delivery",
      "Oil & Shampoo Duo × 1",
      "Subtotal: Rs. 2,340",
      "Delivery: Free",
      "Total: Rs. 2,340",
      "Sample Customer",
      "03001234567",
      "sample@example.test",
      "Sample street 5, test neighborhood, Karachi, Pakistan",
    ]) {
      expect(text).toContain(detail);
    }
    expect(state.records.get(result.id)?.status).toBe("awaiting-confirmation");
    expect(state.records.get(result.id)?.whatsappNotification).toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ["development", "923000000001"],
    ["production", site.contact.whatsapp],
  ])(
    "uses the configured recipient and saved amounts in %s",
    async (mode, number) => {
      state.env.CHECKOUT_WHATSAPP_TEST_NUMBER = "923000000001";
      vi.stubEnv("NODE_ENV", mode);
      const result: CheckoutResult = await (await submit("cod")).json();
      expect(new URL(result.whatsappUrl).pathname).toBe("/" + number);
      state.customer.mockResolvedValueOnce({ email: "other@example.test" });
      expect((await notify(result.id)).status).toBe(404);
      state.customer.mockResolvedValueOnce(null);
      expect((await notify(result.id)).status).toBe(401);
      const request = new Request(
        origin + "/api/orders/" + result.id + "/notify",
        {
          method: "POST",
          headers: { Origin: origin, "Content-Type": "application/json" },
          body: JSON.stringify({ to: "923000000099", total: "Rs. 1" }),
        },
      );
      const response = await notifyOrder(request, {
        params: Promise.resolve({ id: result.id }),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        whatsappUrl: result.whatsappUrl,
      });
      expect((await notify(result.id)).status).toBe(200);
      expect(state.records.get(result.id)?.total).toBe(234000);
    },
  );

  it("rejects unauthorized, changed-total, and invalid screenshot submissions", async () => {
    state.customer.mockResolvedValueOnce(null);
    expect((await submit("cod")).status).toBe(401);
    expect((await submit("cod", undefined, 10)).status).toBe(409);
    expect((await submit("easypaisa-manual")).status).toBe(400);
    expect(
      (
        await submit(
          "easypaisa-manual",
          new File(["not an image"], "fake.png", { type: "image/png" }),
        )
      ).status,
    ).toBe(400);
    expect(state.records.size).toBe(0);
  });

  it("stores a screenshot privately and validates the key and expiry before download", async () => {
    const response = await submit(
      "easypaisa-manual",
      new File([screenshot], "paid.png", { type: "image/png" }),
    );
    expect(response.status).toBe(200);
    const result: CheckoutResult = await response.json();
    const order = [...state.records.values()][0];
    expect(order.status).toBe("awaiting-payment-review");
    const params = Promise.resolve({ id: order._id });
    const invalid = new Request(
      origin + result.receiptPath!.split("?")[0] + "?key=" + "0".repeat(64),
    );
    expect((await downloadReceipt(invalid, { params })).status).toBe(404);
    const download = new Request(origin + result.receiptPath);
    const file = await downloadReceipt(download, { params });
    expect(file.status).toBe(200);
    expect(file.headers.get("content-disposition")).toMatch(/^attachment;/);
    expect(Buffer.from(await file.arrayBuffer())).toEqual(screenshot);
    order.createdAt = new Date(0);
    expect((await downloadReceipt(download, { params })).status).toBe(404);
  });

  it("includes an accessible signed Easypaisa screenshot link and keeps payment pending", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    const response = await submit(
      "easypaisa-manual",
      new File([screenshot], "paid.png", { type: "image/png" }),
    );
    const result: CheckoutResult = await response.json();
    const text = new URL(result.whatsappUrl).searchParams.get("text")!;
    expect(text).toContain("Manual Easypaisa transfer — pending verification");
    const url = new URL(result.receiptPath!, state.env.NEXT_PUBLIC_APP_URL);
    expect(text).toContain(url.href);
    const receipt = await downloadReceipt(new Request(url), {
      params: Promise.resolve({ id: result.id }),
    });
    expect(receipt.status).toBe(200);
    expect(Buffer.from(await receipt.arrayBuffer())).toEqual(screenshot);
    expect(state.records.get(result.id)?.status).toBe(
      "awaiting-payment-review",
    );
    expect(send).not.toHaveBeenCalled();
  });
});
