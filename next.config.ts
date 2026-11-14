import type { NextConfig } from "next";
import { parseEnv } from "./lib/env-schema";

const env = parseEnv(process.env);
const isProduction = process.env.NODE_ENV === "production";
const imagekitEndpoint = env.IMAGEKIT_URL_ENDPOINT;
const imagekitUrl = imagekitEndpoint ? new URL(imagekitEndpoint) : null;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://ik.imagekit.io https://res.cloudinary.com${imagekitUrl ? ` ${imagekitUrl.origin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(imagekitUrl
        ? [
            {
              protocol: "https" as const,
              hostname: imagekitUrl.hostname,
              pathname: `${imagekitUrl.pathname.replace(/\/$/, "")}/**`,
            },
          ]
        : []),
      ...(env.IMAGE_PROVIDER === "cloudinary" && env.CLOUDINARY_CLOUD_NAME
        ? [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: `/${env.CLOUDINARY_CLOUD_NAME}/image/upload/**`,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default config;
