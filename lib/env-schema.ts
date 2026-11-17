import { z } from "zod";

const requiredText = z.string({ error: "is required" }).min(1, "is required");
const optionalText = requiredText.optional();

function hasNoEmbeddedCredentials(value: string): boolean {
  try {
    const url = new URL(value);
    return url.username === "" && url.password === "";
  } catch {
    // The URL schema reports malformed URLs; this refinement checks credentials only.
    return true;
  }
}

const httpUrl = z
  .url({
    protocol: /^https?$/,
    error: "must be a valid HTTP or HTTPS URL",
  })
  .refine(hasNoEmbeddedCredentials, "must not contain embedded credentials");
const optionalHttpsUrl = z
  .url({
    protocol: /^https$/,
    error: "must be a valid HTTPS URL",
  })
  .refine(hasNoEmbeddedCredentials, "must not contain embedded credentials")
  .optional();
const optionalEmail = z
  .email({ error: "must be a valid email address" })
  .optional();
const booleanFlag = z
  .enum(["true", "false"], { error: "must be true or false" })
  .default("false")
  .transform((value) => value === "true");

const serverOrigin = httpUrl
  .refine((value) => {
    const url = URL.parse(value);
    return (
      url !== null &&
      url.href === url.origin + "/" &&
      (url.protocol === "https:" ||
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    );
  }, "must be an HTTPS origin without a path (HTTP is allowed on loopback)")
  .transform((value) => new URL(value).origin);

const smtpFields = {
  SMTP_HOST: optionalText,
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/, "must be an integer between 1 and 65535")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535))
    .optional(),
  SMTP_USER: optionalText,
  SMTP_PASS: optionalText,
  EMAIL_FROM: optionalEmail,
  STORE_CONTACT_EMAIL: optionalEmail,
};
const smtpEnvSchema = z.strictObject(smtpFields).required();
export type SmtpEnv = z.infer<typeof smtpEnvSchema>;

const storefrontEnvSchema = z.strictObject({
  NEXT_PUBLIC_APP_URL: httpUrl,
  BACKEND_URL: serverOrigin.optional(),
  IMAGE_PROVIDER: z
    .enum(["cloudinary", "imagekit"], {
      error: "must be cloudinary or imagekit",
    })
    .default("imagekit"),
  CLOUDINARY_CLOUD_NAME: optionalText,
  IMAGEKIT_URL_ENDPOINT: optionalHttpsUrl,
});

const baseEnvSchema = storefrontEnvSchema.extend({
  MONGODB_URI: requiredText.regex(
    /^mongodb(?:\+srv)?:\/\/(?:[^\s/?]+@)?[^\s/?@]+(?:[/?][^\s]*)?$/,
    "must be a MongoDB connection URI beginning with mongodb:// or mongodb+srv://",
  ),
  JWT_SECRET: requiredText.min(32, "must contain at least 32 characters"),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^[1-9]\d*(?:s|m|h|d|w)$/, "must be a positive duration, such as 7d")
    .default("7d"),
  CRON_SECRET: requiredText
    .min(32, "must contain at least 32 characters")
    .optional(),

  ENABLE_IMAGE_UPLOADS: booleanFlag,
  CLOUDINARY_API_KEY: optionalText,
  CLOUDINARY_API_SECRET: optionalText,
  IMAGEKIT_PUBLIC_KEY: optionalText,
  IMAGEKIT_PRIVATE_KEY: optionalText,

  ENABLE_EMAIL: booleanFlag,
  EMAIL_DELIVERY: z.enum(["smtp", "relay"]).default("smtp"),
  EMAIL_RELAY_SECRET: requiredText
    .min(32, "must contain at least 32 characters")
    .optional(),
  ...smtpFields,
  CHECKOUT_WHATSAPP_TEST_NUMBER: z
    .string()
    .regex(
      /^923\d{9}$/,
      "must be a Pakistani mobile number in international digits, starting with 923",
    )
    .optional(),
  WHATSAPP_ACCESS_TOKEN: optionalText,
  WHATSAPP_PHONE_NUMBER_ID: z.string().regex(/^\d+$/).optional(),
  WHATSAPP_GRAPH_VERSION: z
    .string()
    .regex(/^v\d+\.\d+$/)
    .default("v27.0"),

  // Reserved for a future merchant integration; manual wallet payments do not use these.
  JAZZCASH_ENV: z
    .enum(["sandbox", "production"], { error: "must be sandbox or production" })
    .optional(),
  JAZZCASH_MERCHANT_ID: optionalText,
  JAZZCASH_PASSWORD: optionalText,
  JAZZCASH_INTEGRITY_SALT: optionalText,
  JAZZCASH_API_BASE_URL: optionalHttpsUrl,
  JAZZCASH_RETURN_URL: optionalHttpsUrl,
  EASYPAISA_ENV: z
    .enum(["sandbox", "production"], { error: "must be sandbox or production" })
    .optional(),
  EASYPAISA_STORE_ID: optionalText,
  EASYPAISA_HASH_KEY: optionalText,
  EASYPAISA_API_BASE_URL: optionalHttpsUrl,
  EASYPAISA_RETURN_URL: optionalHttpsUrl,
});

const envSchema = baseEnvSchema.superRefine((env, context) => {
  const requireKeys = (keys: (keyof typeof env)[], message: string) => {
    for (const key of keys) {
      if (env[key] === undefined) {
        context.addIssue({ code: "custom", path: [key], message });
      }
    }
  };

  if (env.ENABLE_IMAGE_UPLOADS) {
    requireKeys(
      env.IMAGE_PROVIDER === "imagekit"
        ? [
            "IMAGEKIT_PUBLIC_KEY",
            "IMAGEKIT_PRIVATE_KEY",
            "IMAGEKIT_URL_ENDPOINT",
          ]
        : [
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
          ],
      "is required when image uploads are enabled for the selected provider",
    );
  }

  if (env.ENABLE_EMAIL) {
    if (env.EMAIL_DELIVERY === "relay") {
      requireKeys(
        ["EMAIL_RELAY_SECRET"],
        "is required when email relay is enabled",
      );
      if (!serverOrigin.safeParse(env.NEXT_PUBLIC_APP_URL).success) {
        context.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_APP_URL"],
          message:
            "must be an HTTPS origin for the email relay (HTTP is allowed on loopback)",
        });
      }
      return;
    }
    requireKeys(
      [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "EMAIL_FROM",
        "STORE_CONTACT_EMAIL",
      ],
      "is required when email is enabled",
    );
  }
});

export type Env = z.infer<typeof envSchema>;

type EnvIssue = { key: string; message: string };

export class EnvironmentValidationError extends Error {
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    super(
      `Invalid environment configuration:\n${issues.map(({ key, message }) => `- ${key}: ${message}`).join("\n")}`,
    );
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

/** Validate only application-owned keys, never the host's unrelated environment. */
function parseSettings<Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
  source: Readonly<Record<string, unknown>>,
) {
  const selected = Object.fromEntries(
    Object.keys(schema.shape).map((key) => {
      const value = source[key];
      return [
        key,
        typeof value === "string" && value.trim() === "" ? undefined : value,
      ];
    }),
  );
  const result = schema.safeParse(selected);

  if (!result.success) {
    // Do not throw Zod's raw error: callers must never receive input values or causes.
    const issues = result.error.issues.map((issue): EnvIssue => {
      const key = String(issue.path[0] ?? "ENVIRONMENT");
      const message =
        key === "SMTP_PORT"
          ? issue.code === "custom"
            ? "is required when email is enabled"
            : "must be an integer between 1 and 65535"
          : issue.message;
      return { key, message };
    });
    throw new EnvironmentValidationError(issues);
  }

  return result.data;
}

export function parseStorefrontEnv(source: Readonly<Record<string, unknown>>) {
  const env = parseSettings(storefrontEnvSchema, source);
  if (source.VERCEL === "1" && !env.BACKEND_URL) {
    throw new EnvironmentValidationError([
      { key: "BACKEND_URL", message: "is required on Vercel" },
    ]);
  }
  if (source.RENDER === "true" && env.BACKEND_URL) {
    throw new EnvironmentValidationError([
      { key: "BACKEND_URL", message: "must be blank on the Render backend" },
    ]);
  }
  if (env.BACKEND_URL === new URL(env.NEXT_PUBLIC_APP_URL).origin) {
    throw new EnvironmentValidationError([
      {
        key: "BACKEND_URL",
        message: "must point to a separate backend origin",
      },
    ]);
  }
  return env;
}

export function parseEnv(source: Readonly<Record<string, unknown>>): Env {
  return parseSettings(envSchema, source);
}

/** The Vercel email function needs SMTP settings, without database credentials. */
export function parseSmtpEnv(
  source: Readonly<Record<string, unknown>>,
): SmtpEnv {
  return parseSettings(smtpEnvSchema, source);
}

/** Safe to print: contains variable names and validation rules, never their values. */
export function formatEnvError(error: unknown): string {
  return error instanceof EnvironmentValidationError
    ? error.message
    : "Environment validation failed. Check the configuration in .env.local.";
}
