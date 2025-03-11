const axios = require("axios");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.PAYPAL_API;

const generateAccessToken = async () => {

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    console.log("genearte access_token", response.data);
    return response.data.access_token;
};

exports.createPaypalOrder = async (req, res) => {
    try {
        const accessToken = await generateAccessToken();
        const { amount } = req.body;

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, 
            {
                intent: "CAPTURE",
                purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ orderID: response.data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.capturePaypalOrder = async (req, res) => {
    try {
        const accessToken = await generateAccessToken();
        const { orderID } = req.body;

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}