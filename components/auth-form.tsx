"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
const inputClass =
  "mt-2 w-full rounded-lg border px-4 py-3 focus:outline-brand-deep";

async function postAuth(
  action: "signup" | "login" | "verify" | "resend",
  data: Record<string, FormDataEntryValue>,
) {
  let response: Response;
  try {
    response = await fetch("/api/auth/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Could not connect. Please try again.");
  }
  const result: {
    ok?: boolean;
    error?: string;
    verificationId?: unknown;
  } | null = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error ?? "Please try again.");
  }
  return result;
}

type Verification = { id: string; email: string };

function VerificationForm({
  verification,
  next,
  onBack,
}: {
  verification: Verification;
  next: string;
  onBack: () => void;
}) {
  const codeInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"verify" | "resend" | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [lastSent, setLastSent] = useState(() => Date.now());

  useEffect(() => {
    codeInput.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setCanResend(true),
      Math.max(0, lastSent + 60_000 - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [lastSent]);

  async function resendCode() {
    if (busy || !canResend) return;
    setBusy("resend");
    setError("");
    setNotice("");
    try {
      await postAuth("resend", { verificationId: verification.id });
      setCanResend(false);
      setLastSent(Date.now());
      if (codeInput.current) codeInput.current.value = "";
      setNotice("We sent a new code. Use the code from the latest email.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="mb-2 text-xl font-semibold">Verify your email</h2>
      <p
        id="verification-instructions"
        className="text-muted-foreground mb-6 text-sm"
      >
        Enter the six-digit code we sent to{" "}
        <strong className="text-foreground break-all">
          {verification.email}
        </strong>
        . Check your spam folder if you don’t see it.
      </p>
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const code = new FormData(event.currentTarget).get("code");
          if (typeof code !== "string") return;
          setBusy("verify");
          setError("");
          setNotice("");
          try {
            await postAuth("verify", { verificationId: verification.id, code });
            window.location.assign(next);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Please try again.",
            );
            setBusy(null);
          }
        }}
      >
        <label className="block text-sm font-medium">
          Verification code
          <input
            ref={codeInput}
            className={inputClass}
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            readOnly={busy !== null}
            aria-describedby="verification-instructions"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-brand-deep text-sm">
            {notice}
          </p>
        )}
        <Button type="submit" disabled={busy !== null} className="w-full">
          {busy === "verify" ? "Verifying…" : "Verify and create account"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={resendCode}
          disabled={busy !== null || !canResend}
        >
          {busy === "resend" ? "Sending…" : "Resend code"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={busy !== null}
        >
          Change email
        </Button>
      </div>
      {!canResend && (
        <p className="text-muted-foreground mt-2 text-xs">
          You can request another code 60 seconds after an email is sent.
        </p>
      )}
    </div>
  );
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "signup" | "login";
  next: string;
}) {
  const emailInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);

  if (verification) {
    return (
      <VerificationForm
        verification={verification}
        next={next}
        onBack={() => {
          setVerification(null);
          window.requestAnimationFrame(() => emailInput.current?.focus());
        }}
      />
    );
  }

  return (
    <div className="max-w-md">
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const data = Object.fromEntries(new FormData(event.currentTarget));
          setBusy(true);
          setError("");
          try {
            const result = await postAuth(mode, data);
            if (mode === "signup") {
              if (typeof result.verificationId !== "string") {
                throw new Error(
                  "Could not start verification. Please try again.",
                );
              }
              setVerification({
                id: result.verificationId,
                email: String(data.email).trim().toLowerCase(),
              });
              setBusy(false);
              return;
            }
            window.location.assign(next);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Please try again.",
            );
            setBusy(false);
          }
        }}
      >
        {mode === "signup" && (
          <label className="block text-sm font-medium">
            Full name
            <input
              className={inputClass}
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email address
          <input
            ref={emailInput}
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        {mode === "signup" && (
          <label className="block text-sm font-medium">
            Mobile number
            <input
              className={inputClass}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="03XXXXXXXXX"
              required
              pattern="(0|92|0092|\+92)3[0-9]{9}"
              maxLength={15}
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Password
          <input
            className={inputClass}
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={8}
            maxLength={128}
          />
          <span className="text-muted-foreground mt-2 block text-xs">
            Use at least 8 characters.
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Log in"}
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-sm">
        {mode === "signup"
          ? "Already have an account? "
          : "New to The Herbliss? "}
        <Link
          className="text-brand-deep font-medium underline"
          href={
            (mode === "signup" ? "/login" : "/signup") +
            "?next=" +
            encodeURIComponent(next)
          }
        >
          {mode === "signup" ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
