import "server-only";
import { createHmac, randomBytes, randomInt } from "node:crypto";
import {
  authCollections,
  customerId,
  hashPassword,
  limitAuth,
} from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { sendVerificationCode } from "@/lib/mail";

const codeLifetime = 10 * 60_000;
const resendDelay = 60_000;
const maxCodeAttempts = 5;
const existingAccount =
  "Unable to create this account. If you already registered, please log in.";
const invalidCode =
  "The code is incorrect, expired, or has reached its attempt limit. You can request a new code.";
const deliveryError =
  "We could not send the verification code. Please try again shortly.";

export class SignupVerificationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

function checkEmailEnabled() {
  if (!getEnv().ENABLE_EMAIL) {
    throw new SignupVerificationError(
      "Email verification is temporarily unavailable. Please try again later.",
      503,
    );
  }
}

function isDuplicate(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  );
}

function codeHash(verificationId: string, code: string) {
  return createHmac("sha256", getEnv().JWT_SECRET)
    .update("signup-email:" + verificationId + ":" + code)
    .digest("hex");
}

function newCode(verificationId: string, now: Date, previousHash?: string) {
  let code: string;
  let hash: string;
  do {
    code = String(randomInt(1_000_000)).padStart(6, "0");
    hash = codeHash(verificationId, code);
  } while (hash === previousHash);
  return {
    code,
    fields: {
      codeHash: hash,
      expiresAt: new Date(now.getTime() + codeLifetime),
      resendAfter: new Date(now.getTime() + resendDelay),
      attemptsRemaining: maxCodeAttempts,
    },
  };
}

async function limitDelivery(email: string) {
  if (!(await limitAuth(email))) {
    throw new SignupVerificationError(
      "Too many attempts. Please try again in 15 minutes.",
      429,
      900,
    );
  }
}

export async function startSignup(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  checkEmailEnabled();
  await limitDelivery(data.email);
  const { customers, pendingSignups } = await authCollections();
  const id = customerId(data.email);
  if (await customers.findOne({ _id: id }, { projection: { _id: 1 } })) {
    throw new SignupVerificationError(existingAccount, 409);
  }

  await pendingSignups.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const passwordHash = await hashPassword(data.password);
  const nonce = randomBytes(16).toString("hex");
  const verificationId = id + "." + nonce;
  const now = new Date();
  const { code, fields } = newCode(verificationId, now);

  try {
    await pendingSignups.updateOne(
      { _id: id, resendAfter: { $lte: now } },
      {
        $set: {
          ...fields,
          nonce,
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    // A concurrent signup or resend may already hold the email's cooldown.
    if (isDuplicate(error)) {
      throw new SignupVerificationError(
        "Wait one minute before requesting another verification code.",
        429,
        60,
      );
    }
    throw error;
  }

  try {
    await sendVerificationCode(data.email, code);
  } catch {
    await pendingSignups
      .deleteOne({ _id: id, nonce, codeHash: fields.codeHash })
      .catch(() => {});
    throw new SignupVerificationError(deliveryError, 503);
  }

  return verificationId;
}

export async function resendSignupCode(verificationId: string) {
  checkEmailEnabled();
  const [id, nonce] = verificationId.split(".");
  const { pendingSignups } = await authCollections();
  const now = new Date();
  const active = { _id: id, nonce, expiresAt: { $gt: now } };
  const pending = await pendingSignups.findOne(active);
  if (!pending) {
    throw new SignupVerificationError(
      "Start signup again to request a new code.",
      400,
    );
  }
  if (pending.resendAfter > now) {
    const wait = Math.ceil(
      (pending.resendAfter.getTime() - now.getTime()) / 1000,
    );
    throw new SignupVerificationError(
      "Wait before requesting a new code.",
      429,
      wait,
    );
  }

  await limitDelivery(pending.email);
  const { code, fields } = newCode(verificationId, now, pending.codeHash);
  const previous = await pendingSignups.findOneAndUpdate(
    { ...active, codeHash: pending.codeHash, resendAfter: { $lte: now } },
    { $set: fields },
    { returnDocument: "before" },
  );
  if (!previous) {
    throw new SignupVerificationError(
      "Wait before requesting a new code.",
      429,
      60,
    );
  }
  try {
    await sendVerificationCode(previous.email, code);
  } catch {
    await pendingSignups
      .updateOne(
        {
          _id: id,
          nonce,
          codeHash: fields.codeHash,
          resendAfter: fields.resendAfter,
        },
        {
          $set: {
            codeHash: previous.codeHash,
            expiresAt: previous.expiresAt,
            attemptsRemaining: previous.attemptsRemaining,
            resendAfter: previous.resendAfter,
          },
        },
      )
      .catch(() => {});
    throw new SignupVerificationError(deliveryError, 503);
  }
}

export async function verifySignupCode(verificationId: string, code: string) {
  const [id, nonce] = verificationId.split(".");
  const { pendingSignups, customers } = await authCollections();
  const now = new Date();
  const hash = codeHash(verificationId, code);
  const active = {
    _id: id,
    nonce,
    expiresAt: { $gt: now },
    attemptsRemaining: { $gt: 0 },
  };
  const pending = await pendingSignups.findOneAndDelete({
    ...active,
    codeHash: hash,
  });

  if (!pending) {
    await pendingSignups.updateOne(
      { ...active, codeHash: { $ne: hash } },
      { $inc: { attemptsRemaining: -1 } },
    );
    throw new SignupVerificationError(invalidCode, 400);
  }

  try {
    await customers.insertOne({
      _id: pending._id,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      createdAt: now,
      emailVerifiedAt: now,
    });
  } catch (error) {
    if (isDuplicate(error))
      throw new SignupVerificationError(existingAccount, 409);
    throw error;
  }
  return pending._id;
}
