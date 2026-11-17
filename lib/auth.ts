import "server-only";
import {
  createHash,
  randomBytes,
  scrypt as deriveKey,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { sessionCookie } from "@/lib/session-cookie";

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deriveKey(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}
const lifetime = 60 * 60 * 24 * 7;
type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
  emailVerifiedAt?: Date;
};
type PendingSignup = Omit<Customer, "createdAt" | "emailVerifiedAt"> & {
  nonce: string;
  codeHash: string;
  attemptsRemaining: number;
  resendAfter: Date;
  expiresAt: Date;
};
type Session = { _id: string; customerId: string; expiresAt: Date };
type Attempt = { _id: string; count: number; expiresAt: Date };
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export async function authCollections() {
  const connection = await connectDB();
  const db = connection.connection.db;
  if (!db) throw new Error("Database unavailable");
  return {
    customers: db.collection<Customer>("customers"),
    pendingSignups: db.collection<PendingSignup>("pending_signups"),
    sessions: db.collection<Session>("customer_sessions"),
    attempts: db.collection<Attempt>("auth_attempts"),
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt);
  return salt + ":" + key.toString("hex");
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, encoded] = stored.split(":");
  const actual = await scrypt(password, salt);
  const expected = Buffer.from(encoded, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function limitAuth(email: string) {
  const { attempts } = await authCollections();
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
  // Persistent, atomic limits shared by all application instances.
  await attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  for (const [key, limit] of [
    [digest(email), 10],
    ["global", 200],
  ] as const) {
    const entry = await attempts.findOneAndUpdate(
      { _id: key + ":" + bucket },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date((bucket + 2) * 15 * 60 * 1000) },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (!entry || entry.count > limit) return false;
  }
  return true;
}

export async function createSession(customerId: string) {
  const { sessions } = await authCollections();
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const jar = await cookies();
  const old = jar.get(sessionCookie)?.value;
  if (old) await sessions.deleteOne({ _id: digest(old) });
  const token = randomBytes(32).toString("hex");
  await sessions.insertOne({
    _id: digest(token),
    customerId,
    expiresAt: new Date(Date.now() + lifetime * 1000),
  });
  jar.set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: lifetime,
  });
}

export async function currentCustomer() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { sessions, customers } = await authCollections();
  const session = await sessions.findOne({
    _id: digest(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  const customer = await customers.findOne(
    { _id: session.customerId },
    { projection: { passwordHash: 0 } },
  );
  return customer
    ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
      }
    : null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) {
    const { sessions } = await authCollections();
    await sessions.deleteOne({ _id: digest(token) });
  }
  jar.delete(sessionCookie);
}

export function customerId(email: string) {
  return digest(email);
}
