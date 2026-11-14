# Confirmed decisions — 13 November 2026

The user's direct follow-up instructions override conflicting parts of the attached master plan. Keep the remaining phased plan and technical requirements.

- Brand: The Herbliss, green leaf logo tilted 46 degrees. Clockwise used as the visual default; the illustrated leaf remains vector-based and editable.
- Architecture: Next.js App Router, TypeScript, Tailwind, shadcn/Radix, MongoDB Atlas with Mongoose, backend inside Next.js. No separate Express server.
- Design: white / #8AFF8A brand; use the supplied reference's announcement strip, spacious navigation, prominent artwork and WhatsApp contact concept without copying its branding. Use owner-supplied artwork, scaled proportionally without modifying label text.
- Image provider: ImageKit. Credentials pending; local images work during setup. Keep a Cloudinary configuration option for the later adapter.
- Delivery: nationwide Pakistan, Rs. 250. Any order containing a duo gets free delivery for the whole order. No spend threshold.
- Products: oil 120 ml / Rs. 749; shampoo 250 ml / Rs. 1,249; lotion 150 ml / Rs. 340; duo oil + shampoo / Rs. 2,000. Initial stock 30 per individual product; the duo consumes component stock.
- Ingredients: “ulci” confirmed as alsi/flaxseed; “Rita” normalized to reetha/soapnut and “Rosemarry” to rosemary. English common names researched in CONTENT_SOURCES.md.
- Content: owner expressly permits standard descriptions and usage text, overriding the original no-copy-invention restriction for those fields. General usage remains a draft pending label/manufacturer review. No invented testimonials, claims, certifications or legal policy text.
- Contact: WhatsApp 0321 3857324, normalized to +92 321 3857324 for links. Do not fabricate social profile URLs. On 14 November the owner requested Facebook, Instagram, YouTube, TikTok and Snapchat icons at the right of the delivery strip; display unlinked, accessible icons until the URLs are supplied.
- Payments: Cash on Delivery and manual Easypaisa transfer to the supplied wallet number. JazzCash and automatic merchant gateway adapters are deferred because the owner has no merchant integration credentials. Never mark a transfer paid based on a customer screenshot, transaction ID or client redirect alone.
- Easypaisa account title and manual verification workflow are still pending. A future order may await manual verification; COD payment remains unpaid until collection. No admin panel is added in this milestone.
- Original online-payment 30-minute expiry cannot be copied blindly onto COD/manual transfers. Define a suitable manual-transfer deadline and order fulfillment workflow before Phase 5/6.
- SMTP not yet configured. Add a setup guide now, implement transport and account email behavior in Phase 4.
- Secrets stay in ignored `.env.local` or host settings. Rotate the secrets shared in chat before production.
- Phase 0 includes a static, explicitly labelled storefront/theme preview. Functional catalog, responsive menu/cart controls, auth, checkout and payment handling are later phase work. No dead search/cart/account controls are shown in this preview.
