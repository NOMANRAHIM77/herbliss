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

const baseEnvSchema = z.strictObject({
  NEXT_PUBLIC_APP_URL: httpUrl,
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

  IMAGE_PROVIDER: z
    .enum(["cloudinary", "imagekit"], {
      error: "must be cloudinary or imagekit",
    })
    .default("imagekit"),
  ENABLE_IMAGE_UPLOADS: booleanFlag,
  CLOUDINARY_CLOUD_NAME: optionalText,
  CLOUDINARY_API_KEY: optionalText,
  CLOUDINARY_API_SECRET: optionalText,
  IMAGEKIT_PUBLIC_KEY: optionalText,
  IMAGEKIT_PRIVATE_KEY: optionalText,
  IMAGEKIT_URL_ENDPOINT: optionalHttpsUrl,

  ENABLE_EMAIL: booleanFlag,
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

const envKeys = Object.keys(
  baseEnvSchema.shape,
) as (keyof typeof baseEnvSchema.shape)[];

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
export function parseEnv(source: Readonly<Record<string, unknown>>): Env {
  const selected = Object.fromEntries(
    envKeys.map((key) => {
      const value = source[key];
      return [
        key,
        typeof value === "string" && value.trim() === "" ? undefined : value,
      ];
    }),
  );
  const result = envSchema.safeParse(selected);

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

/** Safe to print: contains variable names and validation rules, never their values. */
export function formatEnvError(error: unknown): string {
  return error instanceof EnvironmentValidationError
    ? error.message
    : "Environment validation failed. Check the configuration in .env.local.";
}
