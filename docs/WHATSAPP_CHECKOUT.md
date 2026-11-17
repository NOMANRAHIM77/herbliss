# WhatsApp checkout setup

The storefront saves the order and the server-calculated totals in MongoDB. **Send order to Herbliss** asks the server to send that saved order to the store. An Easypaisa notification includes the uploaded screenshot and keeps the payment pending review. The confirmation page distinguishes an order saved to MongoDB from a notification accepted by WhatsApp.

1. Set up a WhatsApp Cloud API sender in your Meta app. Use a separate phone number for the sender and keep the Herbliss WhatsApp number as the recipient. For local testing, add the number in `CHECKOUT_WHATSAPP_TEST_NUMBER` to the test sender’s allowed recipients. The Herbliss recipient should agree to receive the order notifications.
2. In WhatsApp Manager, create the two English (US) utility templates below with positional variables. Wait for Meta to approve them on the business account that owns the sender. Use sample details and a sample screenshot with fictional information in the template submission.
3. In `.env.local` set `WHATSAPP_PHONE_NUMBER_ID` to the sender’s **Phone number ID** and `WHATSAPP_ACCESS_TOKEN` to its access token with `whatsapp_business_messaging` permission. Keep the token server-side. Optionally set `WHATSAPP_GRAPH_VERSION` to the supported Graph API version shown in Meta. Restart the dev server. In production use the deployed server’s environment settings and a production sender token.
4. Place a sample COD order and select **Send order to Herbliss**. Verify it reaches the test phone with the correct total. Repeat with a fictional JPG or PNG screenshot on an Easypaisa order. Production uses the Herbliss contact number configured in `content/site.ts`.

## Templates

Create `herbliss_order_cod` with a text body and no media header.

```text
New Herbliss order {{1}} is awaiting confirmation.
Payment: Cash on delivery
Items: {{2}}
Subtotal: {{3}}
Delivery: {{4}}
Total: {{5}}
Customer: {{6}}
Phone: {{7}}
Email: {{8}}
Delivery address: {{9}}
Please review this order in your store records.
```

Create `herbliss_order_easypaisa` with an **Image** header and this text body.

```text
New Herbliss order {{1}} is awaiting payment review.
Payment: Manual Easypaisa transfer
Items: {{2}}
Subtotal: {{3}}
Delivery: {{4}}
Total: {{5}}
Customer: {{6}}
Phone: {{7}}
Email: {{8}}
Delivery address: {{9}}
Please verify the attached payment screenshot before confirming the order.
```

Examples for variables 1–9, in order: `HL-123456789ABC`, `Husn-e-Resham Moisturising Lotion × 1 (Rs. 340)`, `Rs. 340`, `Rs. 250`, `Rs. 590`, `Sample Customer`, `03001234567`, `sample@example.test`, `Sample Street 5, Karachi, Pakistan`.

If WhatsApp rejects a request, the saved order can be retried. If the connection fails after the send may have reached Meta, check the receiving inbox for the order reference before taking further action. A response from Meta with a message ID indicates acceptance for processing. Confirm receipt in the test inbox when setting up the integration.

[Meta WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview) · [WhatsApp message endpoint](https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-phone-number/message-api)
