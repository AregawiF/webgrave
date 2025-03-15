// const axios = require("axios");

// const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
// const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
// const PAYPAL_API = process.env.PAYPAL_API;

// const generateAccessToken = async () => {

//     const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
//     const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
//         headers: {
//             Authorization: `Basic ${auth}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//     });

//     console.log("genearte access_token", response.data);
//     return response.data.access_token;
// };

// exports.createPaypalOrder = async (req, res) => {
//     try {
//         const accessToken = await generateAccessToken();
//         const { amount } = req.body;

//         const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, 
//             {
//                 intent: "CAPTURE",
//                 purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         res.json({ orderID: response.data.id });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// exports.capturePaypalOrder = async (req, res) => {
//     try {
//         const accessToken = await generateAccessToken();
//         const { orderID } = req.body;

//         const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//                 "Content-Type": "application/json",
//             },
//         });

//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createStripePayment = async (req, res) => {
  try {
   const { amount } = req.body; // Get dynamic amount from frontend

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Create Memorial" },
            unit_amount: amount * 100, // Convert to cents    
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment/cancel`,
    });

    res.json({ url: session.url }); // Send Stripe checkout URL to frontend
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// New endpoint to verify the payment 
exports.verifyPayment = async (req, res) => {
  const { sessionId } = req.body; // Or req.query if you prefer

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.status(200).json({ success: true, message: 'Payment successful' });
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};
