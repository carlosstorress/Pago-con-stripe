const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // Stripe init
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: "https://example.com",
    cancel_url: "https://example.com",
//     shipping_address_collection: {
//       allowed_countries: ["MX"],
//     },
    billingAddressCollection: {
      required: true,
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      },
    },
    custom_fields: [
      {
        key: "engraving",
        label: {
          type: "custom",
          custom: "Nombre del responsable del pago",
        },
        type: "text",
      },
    ],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "mxn",
          unit_amount: 416760, // 10000 = 100 USD
          product_data: {
            name: "Colegiatura",
          },
        },
      },
    ],
  });

  return {
    id: session.id,
  };
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(functions.config().stripe.token);
  let event;

  try {
    const whSec = functions.config().stripe.payments_webhook_secret;

    event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        whSec,
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.");
    return res.sendStatus(400);
  }

  const dataObject = event.data.object;
  const fechaActual = new Date();

  await admin.firestore().collection("pagos").doc().set({
    checkoutSessionId: dataObject.id,
    paymentStatus: dataObject.payment_status,
    amountTotal: dataObject.amount_total,
    shippingOptions: dataObject.shipping_options,
    customerEmail: dataObject.customer_email,
    customerDetails: dataObject.customer_details,
    totalDetails: dataObject.total_details,
    customFields: dataObject.custom_fields,
    billingAddressCollection: dataObject.billingAddressCollection,
    dateTime: fechaActual,
  });
  return res.sendStatus(200);
});
