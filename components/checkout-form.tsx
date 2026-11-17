"use client";

import { useRef, useState } from "react";
import { Banknote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { site } from "@/content/site";
import type { CartItem } from "@/lib/cart";
import {
  maxReceiptBytes,
  receiptMimeTypes,
  type CheckoutCustomer,
  type CheckoutResult,
  type PaymentMethod,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

const inputClass =
  "text-foreground border-input focus:outline-success mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm";
const panelClass =
  "text-foreground rounded-2xl border border-[#d7e4d8] bg-[#f5f8f4] p-5 sm:p-6";
const actionClass =
  "bg-success text-white hover:bg-[#13532c] active:bg-[#13532c]";
const paymentOptions = [
  {
    method: "cod",
    title: "Cash on delivery (COD)",
    detail: "Pay when your order arrives.",
    icon: Banknote,
  },
  {
    method: "easypaisa-manual",
    title: "Online payment",
    detail: "Pay by manual Easypaisa transfer.",
    icon: Wallet,
  },
] as const;

export function CheckoutForm({
  customer,
  items,
  total,
}: {
  customer: CheckoutCustomer;
  items: CartItem[];
  total: number;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<CheckoutResult | null>(null);
  const lastRequest = useRef<{ signature: string; id: string } | null>(null);
  const easypaisa = site.payments.easypaisa;

  if (saved) {
    return (
      <section aria-labelledby="order-request-title" className={panelClass}>
        <h2 id="order-request-title" className="text-lg font-semibold">
          Order request saved
        </h2>
        <p role="status" className="text-success mt-2 text-sm font-semibold">
          Order reference {saved.reference}
        </p>
        <p
          role="status"
          className="text-muted-foreground mt-3 text-sm leading-6"
        >
          Open WhatsApp and tap Send to share your order with Herbliss. Your
          order is saved and awaiting confirmation from the store.
        </p>
        {saved.receiptPath && (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Your payment is pending review. The message includes a link to your
            saved screenshot, valid for 7 days. You can also download it below
            and attach it in WhatsApp.
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive mt-3 text-sm">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild className={actionClass}>
            <a
              href={saved.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={20} />
              Send order to Herbliss
            </a>
          </Button>
          {saved.receiptPath && (
            <Button
              asChild
              variant="outline"
              className="border-success/35 text-success bg-white"
            >
              <a href={saved.receiptPath} download>
                Download screenshot
              </a>
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <form
      className={panelClass + " space-y-6"}
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || !method) return;
        setError("");
        const form = new FormData(event.currentTarget);
        const file = form.get("receipt");
        if (method === "easypaisa-manual") {
          if (
            !(file instanceof File) ||
            !file.size ||
            !receiptMimeTypes.some((type) => type === file.type)
          ) {
            setError("Choose a JPG or PNG payment screenshot.");
            return;
          }
          if (file.size > maxReceiptBytes) {
            setError("The screenshot must be 3 MB or smaller.");
            return;
          }
        }
        form.set("items", JSON.stringify(items));
        form.set("expectedTotal", String(total));
        const signature = JSON.stringify(
          Array.from(form, ([key, value]) => [
            key,
            typeof value === "string"
              ? value
              : [value.name, value.size, value.lastModified, value.type],
          ]),
        );
        if (lastRequest.current?.signature !== signature) {
          lastRequest.current = { signature, id: crypto.randomUUID() };
        }
        form.set("requestId", lastRequest.current.id);
        setBusy(true);
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            body: form,
          });
          const result: CheckoutResult | { error: string } | null =
            await response.json().catch(() => null);
          if (!response.ok || !result || "error" in result) {
            throw new Error(
              result && "error" in result
                ? result.error
                : "Please try submitting your order again.",
            );
          }
          setSaved(result);
        } catch (failure) {
          setError(
            failure instanceof Error ? failure.message : "Please try again.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} className="space-y-4">
        <legend className="text-success mb-4 text-lg font-semibold">
          Delivery details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Full name
            <input
              className={inputClass}
              name="name"
              autoComplete="name"
              defaultValue={customer.name}
              required
              minLength={2}
              maxLength={80}
            />
          </label>
          <label className="text-sm font-medium">
            Mobile number
            <input
              className={inputClass}
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={customer.phone}
              required
              pattern="(0|92|0092|\+92)3[0-9]{9}"
              maxLength={15}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          City
          <input
            className={inputClass}
            name="city"
            autoComplete="address-level2"
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label className="block text-sm font-medium">
          Delivery address
          <textarea
            className={inputClass}
            name="address"
            autoComplete="street-address"
            rows={3}
            required
            minLength={8}
            maxLength={240}
          />
        </label>
      </fieldset>

      <fieldset disabled={busy} className="space-y-3">
        <legend className="text-success mb-4 text-lg font-semibold">
          Payment method
        </legend>
        {paymentOptions.map(({ method: value, title, detail, icon: Icon }) => (
          <label
            key={value}
            className="text-foreground border-success/25 has-checked:border-success flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 has-checked:bg-[#dceee0]"
          >
            <input
              type="radio"
              name="method"
              value={value}
              checked={method === value}
              onChange={() => setMethod(value)}
              required
              className="accent-brand-deep size-4 shrink-0"
            />
            <Icon
              className="text-brand-deep size-5 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="text-muted-foreground mt-1 block text-xs">
                {detail}
              </span>
            </span>
          </label>
        ))}
        {method === "easypaisa-manual" && (
          <div className="border-success/20 mt-4 space-y-4 rounded-xl border bg-[#e8f1e9] p-4">
            <p className="text-sm leading-6">
              Transfer <strong>{formatPrice(total)}</strong> to the Easypaisa
              wallet below, then upload the payment screenshot.
            </p>
            <p className="text-success text-lg font-semibold tracking-wide">
              {easypaisa.number}
            </p>
            <label className="block text-sm font-semibold">
              Payment screenshot
              <input
                className={
                  inputClass +
                  " enabled:hover:border-success/60 transition-colors file:cursor-pointer enabled:cursor-pointer enabled:hover:bg-[#f1f8f1] disabled:cursor-not-allowed disabled:file:cursor-not-allowed motion-reduce:transition-none"
                }
                name="receipt"
                type="file"
                accept={receiptMimeTypes.join(",")}
                required
                aria-describedby="checkout-receipt-help"
              />
            </label>
            <p
              id="checkout-receipt-help"
              className="text-muted-foreground text-xs leading-5"
            >
              JPG or PNG, up to 3 MB. The Herbliss will review your payment.
            </p>
          </div>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={busy}
        className={
          actionClass + " w-full disabled:bg-[#42634d] disabled:opacity-100"
        }
      >
        {busy ? "Saving your order…" : "Submit order details"}
      </Button>
    </form>
  );
}
