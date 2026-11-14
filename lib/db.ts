import "server-only";

import mongoose, { type Mongoose } from "mongoose";

import { getEnv } from "./env";

type MongooseCache = {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // Retain one pool through development hot reloads and warm serverless requests.
  var herblissMongoose: MongooseCache | undefined;
}

const cache = (globalThis.herblissMongoose ??= {
  connection: null,
  promise: null,
});

export async function connectDB(): Promise<Mongoose> {
  if (cache.connection?.connection.readyState === 1) {
    return cache.connection;
  }

  if (!cache.promise) {
    // Validation errors already contain safe diagnostics and should remain actionable.
    const { MONGODB_URI } = getEnv();
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
        socketTimeoutMS: 10_000,
        bufferCommands: false,
        autoCreate: false,
      })
      .catch(() => {
        cache.connection = null;
        throw new Error(
          "Database connection failed. Check Atlas network access and database credentials.",
        );
      })
      .finally(() => {
        cache.promise = null;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
