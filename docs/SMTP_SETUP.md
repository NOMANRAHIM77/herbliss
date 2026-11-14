# Email setup

Email delivery is not implemented in Phase 0. Keep `ENABLE_EMAIL=false` until your SMTP credentials are ready. Phase 4 will add the Nodemailer transport, welcome messages, and password-reset flow; the contact form follows in its planned phase.

Setting `ENABLE_EMAIL=true` currently enables configuration validation only. It does not send messages or activate an email feature. `npm run env:check` validates the enabled SMTP fields; it does not connect to an SMTP server. There is no SMTP verification script yet.

## Option 1: Gmail for development

Gmail is a convenient way to test email during development. Nodemailer recommends a dedicated email provider for production because Gmail may block automated sign-ins and has sending limits. [Nodemailer Gmail guide](https://nodemailer.com/guides/using-gmail)

1. Choose the Gmail account that will send test messages.
2. Enable **2-Step Verification** in that account's security settings.
3. Open [Google App Passwords](https://myaccount.google.com/apppasswords), create an app password for this project, and save it directly in `.env.local`.
4. Update the following entries in `.env.local`. Replace the bracketed examples with your details; they are not working credentials.

```dotenv
ENABLE_EMAIL=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<your Gmail address>
SMTP_PASS=<your Google app password>
EMAIL_FROM=<the same Gmail address>
STORE_CONTACT_EMAIL=<your monitored inbox address>
```

Use the app password, not your normal Google password. Google requires 2-Step Verification for app passwords. The option may be unavailable with security-key-only verification, some work or school accounts, or Advanced Protection. Changing your Google password revokes existing app passwords. [Google's app-password instructions](https://support.google.com/accounts/answer/185833)

Use the authenticated Gmail address for `EMAIL_FROM`; Gmail can rewrite other sender addresses. `STORE_CONTACT_EMAIL` is the inbox that will receive customer contact-form messages once that feature is built. [Nodemailer Gmail behavior](https://nodemailer.com/guides/using-gmail)

Google supports `smtp.gmail.com` on port **465** with TLS from the start, or **587** with STARTTLS. [Google SMTP settings](https://developers.google.com/workspace/gmail/imap/imap-smtp)

## Option 2: Resend SMTP for production

This option requires a domain you own. No email-provider account or paid service has been created by this project.

1. Create a Resend account and open its **Domains** dashboard.
2. Add your domain or a sending subdomain, such as `updates.example.com`. The example is not this store's domain.
3. Copy the exact DNS records supplied by Resend into your DNS provider. These configure SPF and DKIM; do not replace existing email records without checking their purpose.
4. Wait for verification to succeed. Add DMARC using Resend's linked instructions.
5. Create an API key and put it directly in `.env.local` as `SMTP_PASS`.

Resend documents domain ownership, the generated DNS records, and verification in its [domain setup guide](https://resend.com/docs/add-a-domain).

```dotenv
ENABLE_EMAIL=false
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<your Resend API key>
EMAIL_FROM=orders@<your verified sending domain>
STORE_CONTACT_EMAIL=<your monitored inbox address>
```

The SMTP username is literally `resend`; the password is an API key. Ports **465** and **2465** use implicit TLS; **587**, **2587**, and **25** use STARTTLS. Prefer 465 for this configuration. [Resend SMTP settings](https://resend.com/docs/send-with-smtp)

## Validate the configuration

Once every SMTP field above has a real value, change `ENABLE_EMAIL=true` and run:

```powershell
npm run env:check
```

Resolve any missing-field errors. Keep `.env.local` untracked, and configure the same server-side environment variables in your eventual hosting provider. None of these SMTP variables belongs in browser code or should have a `NEXT_PUBLIC_` prefix.

In Phase 4, the transport will use `secure: true` for port 465. Port 587 needs `secure: false` plus `requireTLS: true`. Nodemailer's future `transporter.verify()` check can test connectivity and authentication without sending a message, but it cannot prove acceptance of a particular sender address. [Nodemailer SMTP documentation](https://nodemailer.com/smtp)

No messages have been sent during Phase 0, and delivery has not been verified.
