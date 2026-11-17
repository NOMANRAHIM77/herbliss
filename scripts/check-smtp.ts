import { config } from "dotenv";
import { EnvironmentValidationError, formatEnvError } from "../lib/env-schema";
import { MailConfigurationError, verifySmtpConnection } from "../lib/mail";

config({ path: ".env.local", quiet: true });

async function main() {
  try {
    await verifySmtpConnection();
    console.info(
      "SMTP connection and authentication succeeded. No email was sent.",
    );
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error(formatEnvError(error));
    } else if (error instanceof MailConfigurationError) {
      console.error(error.message);
    } else if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "EAUTH"
    ) {
      console.error(
        "SMTP authentication failed. Check SMTP_USER and SMTP_PASS. Gmail requires an app password.",
      );
    } else {
      console.error(
        "SMTP could not connect securely. Check SMTP_HOST, SMTP_PORT, and outbound access to your mail provider.",
      );
    }
    process.exitCode = 1;
  }
}

void main();
