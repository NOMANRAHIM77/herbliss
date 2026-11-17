export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { parseStorefrontEnv } = await import("./lib/env-schema");
    if (parseStorefrontEnv(process.env).BACKEND_URL) return;
    const { getEnv } = await import("./lib/env");
    getEnv();
  }
}
