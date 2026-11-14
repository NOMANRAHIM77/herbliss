import { config } from "dotenv";

import { formatEnvError, parseEnv } from "../lib/env-schema";

config({ path: ".env.local", quiet: true });

try {
  const env = parseEnv(process.env);
  console.info("Core environment configuration is valid.");
  console.info(
    `Image uploads: ${env.ENABLE_IMAGE_UPLOADS ? `enabled (${env.IMAGE_PROVIDER})` : "disabled"}.`,
  );
  console.info(`Email: ${env.ENABLE_EMAIL ? "enabled" : "disabled"}.`);
  console.info("Merchant payment gateways: not enabled in this phase.");
} catch (error) {
  console.error(formatEnvError(error));
  process.exitCode = 1;
}
