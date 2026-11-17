# The Herbliss

Mobile-first Next.js App Router project for a Pakistan hair and body-care store. The storefront supports customer accounts with email verification and checkout requests confirmed through WhatsApp.

## Run locally

Use Node.js 22.13 or newer (Node 24 LTS recommended for a new deployment) and npm. The tested local runtime is Node 22.13.1. Exact resolved dependencies are recorded in `package-lock.json`.

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
# Edit .env.local and fill the three required variables below.
npm run env:check
npm run db:check
npm run dev
```

Do not overwrite an existing `.env.local`. This workspace already has a local file containing the supplied database and JWT settings. Open the Local URL printed by Next.js (normally http://localhost:3000).

Core required environment variables: `NEXT_PUBLIC_APP_URL`, `MONGODB_URI`, and a random `JWT_SECRET` of at least 32 characters. Keep the MongoDB user/password and JWT secret in local or hosting environment settings only. Rotate credentials previously shared in chat before deployment. No secret value belongs in content files or a `NEXT_PUBLIC_` variable.

`npm run env:check` checks configuration without a database request. `npm run db:check` connects and pings Atlas, then disconnects; it does not create or change data. The server validates configuration at startup and caches its Mongoose connection across hot reloads and warm serverless requests. Database errors are sanitized rather than printing connection strings.

## Deploy

Host the Next.js storefront on Vercel and its API on Render Free. Gmail verification emails are sent by a protected Vercel function, called from Render over HTTPS. For dashboard settings, environment variables and launch checks, see [Deployment](docs/DEPLOYMENT.md).

## Project layout

- `app/`: App Router, global theme, preview, loading, error and 404 pages.
- `components/`: leaf brand mark and the first Radix-based shadcn-compatible component.
- `content/site.ts`: the single brand-name setting, contact details, shipping/payment decisions, and editable page text.
- `content/products.ts`: supplied product data and draft descriptions/usage. This is preview data, not a live inventory source.
- `public/images/`: owner-supplied artwork and a landscape hero adapted at the owner's request, rendered using `next/image`, responsive sizes and generated blur placeholders. The original artwork is retained.
- `lib/env-schema.ts`, `lib/env.ts`: Zod validation and server-only access.
- `lib/db.ts`: cached Node.js/Mongoose connection; no separate Express service.
- `scripts/`: environment and read-only Atlas checks.
- `tests/`: configuration, account verification and checkout tests.
- `docs/`: SMTP instructions, content provenance, technical sources and implementation decisions.

## Services and configuration

The selected image provider is **ImageKit**. While `ENABLE_IMAGE_UPLOADS=false`, supplied local images remain available and no upload is attempted. Set `IMAGE_PROVIDER=imagekit`, fill all three `IMAGEKIT_*` variables and set `ENABLE_IMAGE_UPLOADS=true` to require upload credentials. Cloudinary remains a supported configuration option; only the selected provider's keys are required. The upload adapter and idempotent seed script belong to Phase 2 and are not implemented yet.

Signup sends an email verification code when SMTP is configured and `ENABLE_EMAIL=true`. Follow [the SMTP setup guide](docs/SMTP_SETUP.md) to configure the sender and run `npm run smtp:check`. For Gmail, use a Google app password as `SMTP_PASS`.

The original JazzCash/Easypaisa merchant variables remain blank in `.env.example` for future integrations. They are inactive: the owner's updated scope is **COD plus manually verified Easypaisa wallet transfer**. A wallet number alone cannot provide automatic gateway verification. See [the updated scope](docs/DECISIONS.md).

Checkout saves requests in the MongoDB `checkout_orders` collection. The **Send order to Herbliss** button sends the saved order from the server using the WhatsApp Cloud API. Manual Easypaisa requests stay pending payment review, and the server attaches the screenshot to the notification. See [WhatsApp checkout setup](docs/WHATSAPP_CHECKOUT.md).

## Confirmed store rules

| Product              | Size            | Price     | Initial units        |
| -------------------- | --------------- | --------- | -------------------- |
| Husn E Zulf hair oil | 120 ml          | Rs. 749   | 30                   |
| Husn E Zulf shampoo  | 250 ml          | Rs. 1,249 | 30                   |
| Husn-e-Resham lotion | 150 ml          | Rs. 340   | 30                   |
| Oil + shampoo duo    | 120 ml + 250 ml | Rs. 2,000 | Uses component stock |

Delivery is Rs. 250 across Pakistan. An order containing the duo has free delivery for the **whole order**, including extra products. There is no spend-based free-shipping threshold. The duo is not advertised as a product-price discount: the singles total Rs. 1,998.

Money is represented as integer **paisa** (Rs. 1 = 100 paisa). The checkout server calculates product prices and delivery from the catalog. The store confirms availability on WhatsApp.

## Validation

```powershell
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
npm audit
```

The foundation includes CSS theme tokens, Inter through `next/font`, accessible color pairs, 44px minimum interactive targets, reduced-motion styles and security headers. Public preview pages are marked `noindex` until the catalog and launch configuration are complete. The CSP currently permits inline Next.js scripts/styles; a nonce-based policy and full security review are launch-phase work.

## Seeding roadmap

Phase 2 will add Mongoose models, ImageKit/Cloudinary upload adapters and `scripts/seed.ts`, with upsert-by-slug behavior. Re-running content seeding must not reset sold stock. The current product snapshot is deliberately not automatically written to Atlas.

## Manual acceptance checklist

Phase 0:

- Open the preview at 360px, 768px and 1280px. Check for horizontal overflow, image clipping, focus visibility and readable text.
- Use keyboard navigation and the skip link. Confirm collection links and WhatsApp links target the supplied number.
- Confirm images stay proportional and all four prices/sizes match the owner input.
- Confirm `.env.local` is ignored and `env:check` does not print credentials.

Later milestones (not yet available):

- Guest browsing, search and filters; add items before login.
- Guest checkout redirects to login/signup and returns with the cart intact.
- Cart merge caps quantities at live stock, including shared duo inventory.
- Complete a COD order; verify server-calculated totals and stock reservation.
- Start an Easypaisa transfer, record a reference, and confirm the order stays unpaid until the merchant verifies receipt.
- Reject/expire an unpaid manual transfer, release inventory, and retry without duplicate reservations.
- Exercise out-of-stock handling and concurrent last-unit purchases.
- Verify shipping: Rs. 250 normally; Rs. 0 for the whole order containing a duo.
- Test password reset expiry/single use, account isolation, email failure handling and the entire checkout flow at 360px.

Track remaining inputs in [PLACEHOLDERS.md](PLACEHOLDERS.md), phase status in [PROGRESS.md](PROGRESS.md), and original-versus-updated decisions in [docs/DECISIONS.md](docs/DECISIONS.md).
