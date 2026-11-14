import "server-only";

import { parseEnv, type Env } from "./env-schema";

let cachedEnv: Env | undefined;

/** Server-only access. Call during startup so missing core settings fail immediately. */
export function getEnv(): Env {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}
