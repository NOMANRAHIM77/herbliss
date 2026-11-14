import { describe, expect, it } from "vitest";

import {
  EnvironmentValidationError,
  formatEnvError,
  parseEnv,
} from "../lib/env-schema";

const core = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  MONGODB_URI: "mongodb://127.0.0.1:27017/herbliss",
  JWT_SECRET: "test-secret-with-at-least-thirty-two-characters",
};

describe("environment configuration", () => {
  it("accepts core-only setup and defaults external services to disabled", () => {
    const env = parseEnv(core);
    expect(env.ENABLE_EMAIL).toBe(false);
    expect(env.ENABLE_IMAGE_UPLOADS).toBe(false);
    expect(env.IMAGE_PROVIDER).toBe("imagekit");
    expect(env.JWT_EXPIRES_IN).toBe("7d");
    expect(env.JAZZCASH_MERCHANT_ID).toBeUndefined();
    expect(env.EASYPAISA_STORE_ID).toBeUndefined();
  });

  it("ignores unrelated host environment variables", () => {
    expect(parseEnv({ ...core, UNRELATED_SYSTEM_SETTING: "value" })).toEqual(
      parseEnv(core),
    );
  });

  it.each(["", "   ", "short"])(
    "rejects missing or short JWT secrets",
    (JWT_SECRET) => {
      expect(() => parseEnv({ ...core, JWT_SECRET })).toThrow(/JWT_SECRET/);
    },
  );

  it.each(["NEXT_PUBLIC_APP_URL", "MONGODB_URI"] as const)(
    "rejects a blank %s",
    (key) => {
      expect(() => parseEnv({ ...core, [key]: "   " })).toThrow(key);
    },
  );

  it("normalizes optional blank values without enabling unfinished services", () => {
    const env = parseEnv({
      ...core,
      CRON_SECRET: "",
      SMTP_PORT: " ",
      EMAIL_FROM: "",
      IMAGEKIT_PRIVATE_KEY: "",
      ENABLE_EMAIL: "",
    });
    expect(env.SMTP_PORT).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.ENABLE_EMAIL).toBe(false);
  });

  it.each(["ftp://example.com", "not-a-url", "javascript:alert(1)"])(
    "rejects invalid application URLs",
    (NEXT_PUBLIC_APP_URL) => {
      expect(() => parseEnv({ ...core, NEXT_PUBLIC_APP_URL })).toThrow(
        /NEXT_PUBLIC_APP_URL/,
      );
    },
  );

  it("requires a MongoDB URI and accepts the Atlas SRV scheme", () => {
    expect(() =>
      parseEnv({ ...core, MONGODB_URI: "https://example.com/database" }),
    ).toThrow(/MONGODB_URI/);
    expect(
      parseEnv({
        ...core,
        MONGODB_URI: "mongodb+srv://example.mongodb.net/herbliss",
      }).MONGODB_URI,
    ).toMatch(/^mongodb\+srv:/);
  });

  it.each([
    "mongodb://",
    "mongodb:///database",
    "mongodb+srv://user:password@/database",
  ])("rejects MongoDB URIs without a host", (MONGODB_URI) => {
    expect(() => parseEnv({ ...core, MONGODB_URI })).toThrow(/MONGODB_URI/);
  });

  it.each(["yes", "1", "FALSE"])(
    "requires explicit true or false service flags",
    (ENABLE_EMAIL) => {
      expect(() => parseEnv({ ...core, ENABLE_EMAIL })).toThrow(/ENABLE_EMAIL/);
    },
  );

  it("requires the selected image provider credentials when uploads are enabled", () => {
    expect(() => parseEnv({ ...core, ENABLE_IMAGE_UPLOADS: "true" })).toThrow(
      /IMAGEKIT_PRIVATE_KEY/,
    );
    expect(() =>
      parseEnv({
        ...core,
        ENABLE_IMAGE_UPLOADS: "true",
        IMAGE_PROVIDER: "cloudinary",
      }),
    ).toThrow(/CLOUDINARY_API_SECRET/);
  });

  it("allows ImageKit without Cloudinary credentials", () => {
    expect(
      parseEnv({
        ...core,
        ENABLE_IMAGE_UPLOADS: "true",
        IMAGEKIT_PUBLIC_KEY: "test-public-key",
        IMAGEKIT_PRIVATE_KEY: "test-private-key",
        IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/test",
      }).ENABLE_IMAGE_UPLOADS,
    ).toBe(true);
  });

  it("allows Cloudinary without ImageKit credentials", () => {
    expect(
      parseEnv({
        ...core,
        ENABLE_IMAGE_UPLOADS: "true",
        IMAGE_PROVIDER: "cloudinary",
        CLOUDINARY_CLOUD_NAME: "test-cloud",
        CLOUDINARY_API_KEY: "test-key",
        CLOUDINARY_API_SECRET: "test-secret",
      }).ENABLE_IMAGE_UPLOADS,
    ).toBe(true);
  });

  it("requires complete SMTP configuration only when email is enabled", () => {
    expect(() => parseEnv({ ...core, ENABLE_EMAIL: "true" })).toThrow(
      /SMTP_HOST/,
    );
    const env = parseEnv({
      ...core,
      ENABLE_EMAIL: "true",
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "test-user",
      SMTP_PASS: "test-password",
      EMAIL_FROM: "sender@example.com",
      STORE_CONTACT_EMAIL: "contact@example.com",
    });
    expect(env.SMTP_PORT).toBe(587);
    expect(env.ENABLE_EMAIL).toBe(true);
  });

  it.each(["0", "65536", "587.5", "not-a-port"])(
    "rejects an invalid SMTP port even with email disabled",
    (SMTP_PORT) => {
      expect(() => parseEnv({ ...core, SMTP_PORT })).toThrow(/SMTP_PORT/);
    },
  );

  it.each(["EMAIL_FROM", "STORE_CONTACT_EMAIL"])(
    "validates optional email values even with email disabled",
    (key) => {
      expect(() => parseEnv({ ...core, [key]: "invalid-email" })).toThrow(key);
    },
  );

  it.each([
    "IMAGEKIT_URL_ENDPOINT",
    "JAZZCASH_API_BASE_URL",
    "EASYPAISA_RETURN_URL",
  ])("validates optional service URLs even with services disabled", (key) => {
    expect(() => parseEnv({ ...core, [key]: "ftp://example.com" })).toThrow(
      key,
    );
  });

  it.each([
    "IMAGEKIT_URL_ENDPOINT",
    "JAZZCASH_API_BASE_URL",
    "JAZZCASH_RETURN_URL",
    "EASYPAISA_API_BASE_URL",
    "EASYPAISA_RETURN_URL",
  ])("requires HTTPS for optional external service URLs", (key) => {
    expect(() =>
      parseEnv({ ...core, [key]: "http://example.com/service" }),
    ).toThrow(/HTTPS/);
    expect(() =>
      parseEnv({ ...core, [key]: "https://example.com/service" }),
    ).not.toThrow();
  });

  it.each([
    "NEXT_PUBLIC_APP_URL",
    "IMAGEKIT_URL_ENDPOINT",
    "JAZZCASH_API_BASE_URL",
    "JAZZCASH_RETURN_URL",
    "EASYPAISA_API_BASE_URL",
    "EASYPAISA_RETURN_URL",
  ])("rejects embedded credentials in application and service URLs", (key) => {
    const secret = "private-url-sentinel";
    try {
      parseEnv({
        ...core,
        [key]: `https://username:${secret}@example.com/service`,
      });
      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect(formatEnvError(error)).toContain(
        "must not contain embedded credentials",
      );
      expect(formatEnvError(error)).toContain(key);
      expect(formatEnvError(error)).not.toContain(secret);
    }
  });

  it("allows HTTP for the local application URL without credentials", () => {
    expect(parseEnv(core).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(() =>
      parseEnv({
        ...core,
        NEXT_PUBLIC_APP_URL: "http://username:password@localhost:3000",
      }),
    ).toThrow(/embedded credentials/);
  });

  it.each(["0d", "-1h", "forever"])(
    "rejects invalid session expiration durations",
    (JWT_EXPIRES_IN) => {
      expect(() => parseEnv({ ...core, JWT_EXPIRES_IN })).toThrow(
        /JWT_EXPIRES_IN/,
      );
    },
  );

  it("never includes supplied secrets or raw error details in printable diagnostics", () => {
    const secret = "private-sentinel";
    try {
      parseEnv({
        ...core,
        JWT_SECRET: secret,
        MONGODB_URI: `https://${secret}@example.com`,
      });
      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      const message = formatEnvError(error);
      expect(message).toContain("JWT_SECRET");
      expect(message).toContain("MONGODB_URI");
      expect(message).not.toContain(secret);
      expect(error).not.toHaveProperty("cause");
    }
    expect(formatEnvError(new Error(secret))).not.toContain(secret);
  });
});
