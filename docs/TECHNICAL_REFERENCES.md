# Technical references

Reviewed on 13 November 2026. These references support the Phase 0 implementation and later integration work; listing a reference does not mean its feature is already implemented.

## Framework and runtime

- The project selected **Next.js 16.4.6** and **React 19.3.1**, reported by the npm registry during setup. The lockfile records the installed dependency versions.
- The local runtime is **Node.js 22.13.1**. Next.js documents a minimum Node version of **20.9** and TypeScript **5.1**. Individual dependencies can have stricter requirements; check their `engines` fields when upgrading.
- The [App Router installation guide](https://nextjs.org/docs/app/getting-started/installation) documents manual installation, TypeScript setup, `next dev`, `next build`, `next start`, and standalone ESLint commands.
- [Next.js 16.4 release notes](https://nextjs.org/blog/next-16-4) describe the current release series. The [3 November 2026 security release](https://nextjs.org/blog/november-2026-security-release) identifies **16.4.5** as a patched Active LTS version; 16.4.6 is newer than that security release.

The application keeps its backend in Next.js Route Handlers and Server Actions. Later authentication work must follow the installed version's `proxy.ts` convention and still authorize every protected server endpoint independently.

## ImageKit credentials

ImageKit is the selected image provider. Local supplied artwork can be used during setup while account credentials are pending. Image upload and seed integration belong to the catalog phase.

1. Sign in to ImageKit and open [Developer options → API keys](https://imagekit.io/dashboard/developer/api-keys).
2. Copy the public key and private key into `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` in `.env.local`.
3. Open [URL endpoints](https://imagekit.io/dashboard/url-endpoints) and copy the actual account endpoint into `IMAGEKIT_URL_ENDPOINT`.
4. Set `IMAGE_PROVIDER=imagekit`. Do not fill Cloudinary credentials when using ImageKit.

The private key is a server-side secret. ImageKit recommends restricted keys with only the permissions needed; the planned seed uploader will need media upload access. See [ImageKit API keys](https://imagekit.io/docs/api-keys). The official [integration documentation](https://imagekit.io/docs/integration/php) identifies the dashboard locations for API keys and URL endpoints; it is used here only for credential discovery, not as the application's SDK choice.

## SMTP

Follow [SMTP_SETUP.md](./SMTP_SETUP.md) for configuration and phase status.

- [Google app passwords](https://support.google.com/accounts/answer/185833): 2-Step Verification, availability restrictions, and password revocation.
- [Google SMTP documentation](https://developers.google.com/workspace/gmail/imap/imap-smtp): SMTP hostname, ports, and TLS modes.
- [Nodemailer Gmail guide](https://nodemailer.com/guides/using-gmail): supported authentication and Gmail limitations.
- [Nodemailer SMTP transport](https://nodemailer.com/smtp): transport options and non-delivery verification.
- [Resend SMTP](https://resend.com/docs/send-with-smtp): host, username, API-key authentication, and ports.
- [Resend domain setup](https://resend.com/docs/add-a-domain): domain verification and DNS configuration.

## Dependency compatibility and audit

TypeScript is pinned to the latest supported 6.0 patch series because the current `typescript-eslint` release requires TypeScript below 6.1. ESLint uses the current 10.x release. Vitest's configuration uses `.mts` for explicit ESM.

Some bundled React/import/accessibility lint plugins still declare peer ranges ending at ESLint 9. npm reports those peer-range warnings with ESLint 10; the actual lint command is checked on this project. Keep this tooling compatibility limitation visible until upstream updates its declarations.

An exact, scoped override gives `@typescript-eslint/typescript-estree@8.72.2` the patched `minimatch@11.0.8` to resolve [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). The parser only calls `minimatch(filePath, pattern, { dot: true })`; it uses none of v11's removed regex APIs. A comparison of the old and patched matchers across 196 representative patterns produced identical results. Older plugin matchers are unaffected by the override. Remove this exception when the parser updates its own dependency. See [the parser source](https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/v8.72.2/packages/typescript-estree/src/useProgramFromProjectService.ts) and [matcher documentation](https://raw.githubusercontent.com/isaacs/minimatch/v11.0.1/README.md).

## Payment scope

The user's latest instructions replace the original gateway-only requirement with **Cash on Delivery** and an **Easypaisa mobile-wallet option**. No merchant gateway documentation, merchant account, or automated verification capability has been supplied. The project must not invent endpoints, hashes, callbacks, or automatic payment confirmation.

The later payment phase must distinguish a manual transfer awaiting merchant verification from a paid order. The receiving number is recorded in `content/site.ts`; account title and the verification workflow remain inputs for that phase. Merchant integration documentation would only be required if automatic gateway payments are added later. The current setup does not process payments.
