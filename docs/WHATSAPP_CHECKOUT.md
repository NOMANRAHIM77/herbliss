# WhatsApp checkout

Checkout saves the order and server-calculated prices in MongoDB. **Send order to Herbliss** opens WhatsApp with those saved details in the message composer. The customer taps **Send** in WhatsApp. No Meta account, Cloud API token, template or sender ID is required.

Production sends customers to **0321 3857324** (`923213857324`), configured in `content/site.ts`. Local development can use `CHECKOUT_WHATSAPP_TEST_NUMBER`; without it, the store number is used.

The draft includes the order reference, date, products, quantities, unit and line prices, subtotal, shipping, total, payment method, customer name, phone, email, and delivery address. Easypaisa orders also include a signed screenshot download link valid for seven days from order creation. The customer can download and manually attach the image too. A click-to-chat link cannot automatically attach a file or press Send.

The confirmation page never claims a message was sent or delivered. Orders remain awaiting store confirmation; Easypaisa payments remain pending manual review. WhatsApp drafts can be edited by customers, so verify prices and payment against the saved order reference in MongoDB.

The `/api/orders/[id]/notify` compatibility endpoint returns a draft only to the authenticated owner. It does not send any external messages. Existing Meta environment variables are unused and may be removed.

Deploy both Vercel and Render from the updated commit. Test COD and Easypaisa: save an order, click the WhatsApp button, check the recipient and details, and tap Send yourself when ready. The app cannot observe whether the customer completes this final step.

[WhatsApp click-to-chat documentation](https://faq.whatsapp.com/5913398998672934)
