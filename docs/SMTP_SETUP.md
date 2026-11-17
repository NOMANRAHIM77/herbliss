# Email setup

Signup uses SMTP to send a one-time verification code to the email address entered on the form. The message appears from **The Herbliss** at your configured sender address. Keep `ENABLE_EMAIL=false` until your SMTP credentials are ready.

## Render Free with Gmail and no domain

Render Free blocks Gmail's SMTP ports. The application supports `EMAIL_DELIVERY=relay` on Render: Render creates the code and calls the Vercel storefront over HTTPS using a shared `EMAIL_RELAY_SECRET`. Vercel sends the email through Gmail. Add the SMTP settings to **Vercel**, and use the same relay secret on both hosts. Follow the exact environment-variable tables and deployment order in [Deployment](DEPLOYMENT.md). [Render Free limits](https://render.com/docs/free) · [Vercel SMTP support](https://vercel.com/kb/guide/serverless-functions-and-smtp)

Keep `EMAIL_DELIVERY=smtp` (or leave it blank) for local development. The local `smtp:check` command tests a direct connection only; it does not test the deployed relay.

## Option 1: Gmail for development

Gmail is a convenient way to test email during development. Nodemailer recommends a dedicated email provider for production because Gmail may block automated sign-ins and has sending limits. [Nodemailer Gmail guide](https://nodemailer.com/guides/using-gmail)

1. Choose the Gmail account that will send the codes. It can be a Gmail inbox dedicated to The Herbliss.
2. Enable **2-Step Verification** in that account's [security settings](https://myaccount.google.com/security).
3. Open [Google App Passwords](https://myaccount.google.com/apppasswords) and create an app password named **Herbliss verification**.
4. In the project's existing `.env.local`, add or update these entries. Substitute your sender address and app password.

```dotenv
ENABLE_EMAIL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sender@gmail.com
SMTP_PASS=<your Google app password, without spaces>
EMAIL_FROM=your-sender@gmail.com
STORE_CONTACT_EMAIL=your-sender@gmail.com
```

Use the generated app password in `SMTP_PASS` and keep it private in `.env.local`. Google requires 2-Step Verification for app passwords. The option may be unavailable with security-key-only verification, some work or school accounts, or Advanced Protection. Changing your Google password revokes existing app passwords. [Google's app-password instructions](https://support.google.com/accounts/answer/185833)

Use the authenticated Gmail address for `EMAIL_FROM` because Gmail can rewrite other sender addresses. Use a monitored inbox for `STORE_CONTACT_EMAIL`, which is the reply address. Customers receive their codes at the address they enter during signup. [Nodemailer Gmail behavior](https://nodemailer.com/guides/using-gmail)

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
ENABLE_EMAIL=true
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<your Resend API key>
EMAIL_FROM=orders@<your verified sending domain>
STORE_CONTACT_EMAIL=<your monitored inbox address>
```

The SMTP username is literally `resend`; the password is an API key. Ports **465** and **2465** use implicit TLS; **587**, **2587**, and **25** use STARTTLS. Prefer 465 for this configuration. [Resend SMTP settings](https://resend.com/docs/send-with-smtp)

## Validate the configuration

With the credentials in `.env.local` and `ENABLE_EMAIL=true`, run both commands from the project directory.

```powershell
npm run env:check
npm run smtp:check
```

The first command validates your configuration. The second connects using TLS and authenticates without sending a message. To confirm actual delivery, restart the app with `npm run dev`, sign up with an inbox you can open, and enter the code from that email. Check the Spam folder if the email is missing. [Nodemailer SMTP documentation](https://nodemailer.com/smtp)

If authentication fails, confirm you used the Gmail sender address and its current app password. If the connection fails, check that your network allows outbound SMTP. Gmail can also use port 587. Keep `.env.local` untracked and add the same server-side variables to your eventual hosting environment.
