# Remaining inputs and unfinished features

## Inputs still required

- ImageKit public key, private key and URL endpoint (store in `.env.local`, not here).
- SMTP configuration and the store's receiving contact email. See `docs/SMTP_SETUP.md`.
- Easypaisa account title. Receiving number is already recorded in `content/site.ts`.
- Manual-transfer verification workflow and payment deadline before checkout/payment phases.
- Instagram is linked to the supplied Husn E Zulf profile. Other social platforms are omitted at the owner's request.
- Shipping timelines, return/refund policy, privacy policy and terms. No legal text is invented.
- About page and FAQ details; additional homepage/banner copy if desired.
- Complete product-label ingredient lists and the lotion's wax type. Current lists are labelled as key ingredients, not a full formulation.
- Manufacturer review of draft usage/descriptions in `content/products.ts` before launch.
- Production domain and rotated database/JWT credentials before launch.

## Clearly limited preview

- `app/page.tsx` is a Phase 0 visual preview with supplied images/prices. Its notice states that online ordering is not open yet.
- `content/products.ts` is a typed catalog snapshot. Add-to-cart controls are available; stock is not yet database-backed.
- Filters, a menu drawer, order submission, order tracking and payment flows remain pending. Search, accounts, cart and authenticated checkout review are implemented below.
- Image upload, seed and email transport implementations are planned for later phases.
- No fake social links, testimonials, delivery dates, product discounts or stock claims are displayed.
- No placeholder imagery is needed: owner-supplied product artwork is present.
- The footer includes policy/tracking labels marked coming soon. Newsletter controls are disabled and labelled coming soon until subscription storage, consent handling and email delivery are implemented.

## Account and cart implementation notes

- Signup/login/profile/logout are now implemented. Email verification and password recovery still need the later SMTP workflow.
- Search and a browser-persisted cart are implemented. When browser storage is unavailable, the cart works only in memory for that page session.
- Cart quantities use the supplied catalog allocation, not live stock reservations. Checkout provides authenticated order review; database inventory, order creation, delivery address collection and payments are still pending.
- Authentication uses built-in Node scrypt and revocable opaque database sessions; it does not use the reserved JWT setting.
- New functionality has not been verified, at the owner's request.
