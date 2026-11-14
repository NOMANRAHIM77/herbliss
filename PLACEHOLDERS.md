# Remaining inputs and unfinished features

## Inputs still required

- ImageKit public key, private key and URL endpoint (store in `.env.local`, not here).
- SMTP configuration and the store's receiving contact email. See `docs/SMTP_SETUP.md`.
- Easypaisa account title. Receiving number is already recorded in `content/site.ts`.
- Manual-transfer verification workflow and payment deadline before checkout/payment phases.
- Facebook, Instagram, YouTube, TikTok and Snapchat profile URLs. Their icons appear at the right of the delivery strip as non-interactive placeholders until links are supplied.
- Shipping timelines, return/refund policy, privacy policy and terms. No legal text is invented.
- About page and FAQ details; additional homepage/banner copy if desired.
- Complete product-label ingredient lists and the lotion's wax type. Current lists are labelled as key ingredients, not a full formulation.
- Manufacturer review of draft usage/descriptions in `content/products.ts` before launch.
- Production domain and rotated database/JWT credentials before launch.

## Clearly limited preview

- `app/page.tsx` is a Phase 0 visual preview with supplied images/prices. Its notice states that online ordering is not open yet.
- `content/products.ts` is a typed input snapshot. Stock is not yet database-backed; no purchasing controls are displayed.
- Search, filters, cart, menu drawer, authentication, account, checkout, order tracking and payment flows are not implemented yet.
- Image upload, seed and email transport implementations are planned for later phases.
- No fake social links, testimonials, delivery dates, product discounts or stock claims are displayed.
- No placeholder imagery is needed: owner-supplied product artwork is present.
