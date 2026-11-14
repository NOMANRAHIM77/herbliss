import { config } from "dotenv";
import mongoose from "mongoose";

import { EnvironmentValidationError, formatEnvError } from "../lib/env-schema";

config({ path: ".env.local", quiet: true });

async function checkDatabase() {
  try {
    const { connectDB } = await import("../lib/db");
    const connection = await connectDB();
    const database = connection.connection.db;

    if (!database) {
      throw new Error("Database connection unavailable.");
    }

    await database.admin().ping();
    console.info("MongoDB connection and read-only ping succeeded.");
  } catch (error) {
    console.error(
      error instanceof EnvironmentValidationError
        ? formatEnvError(error)
        : "Database check failed. Check Atlas network access, database credentials, and the connection URI in .env.local.",
    );
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      console.error("Database connection could not be closed cleanly.");
      process.exitCode = 1;
    }
  }
}

void checkDatabase();
