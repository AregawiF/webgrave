const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring'); 
const Order = require('../models/order.model'); 

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const PAYFAST_PROCESS_URL = process.env.PAYFAST_PROCESS_URL || 'https://sandbox.payfast.co.za/eng/process'; 
const PAYFAST_VALIDATE_URL = process.env.PAYFAST_VALIDATE_URL || 'https://sandbox.payfast.co.za/eng/query/validate'; 
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL; // Needed for notify_url

/**
 * Generates PayFast signature
 * @param {object} data - Payment data object
 * @param {string} passphrase - Optional PayFast passphrase
 * @returns {string} MD5 Hash signature
 */
const generateSignature = (data, passphrase = null) => {
    let pfOutput = '';
    for (let key in data) {
        if (data.hasOwnProperty(key) && data[key] !== '') {
            pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
        }
    }

    let getString = pfOutput.slice(0, -1);

    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    }

    // Generate MD5 hash
    return crypto.createHash('md5').update(getString).digest('hex');
};


/**
 * Prepare data for PayFast payment form.
 * The actual redirection happens via a form POST from the frontend.
 */
exports.createPayfastPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const itemName = "Memorial Payment";
        const itemDescription = "Payment for creating a memorial";
        const userId = req.user.userId; 

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount specified." });
        }
        if (!userId) {
             return res.status(401).json({ error: "User not authenticated." });
        }

        const order = await Order.create({
            status: 'unpaid',
            amount: amount,
            userId: userId,
        });

        const orderId = order._id.toString(); // Use MongoDB's _id as the unique payment ID

        // 2. Prepare data for PayFast form
        const paymentData = {
            merchant_id: PAYFAST_MERCHANT_ID,
            merchant_key: PAYFAST_MERCHANT_KEY,
            return_url: `${FRONTEND_URL}/payment/success?order_id=${orderId}`, // Send orderId back
            cancel_url: `${FRONTEND_URL}/payment/cancel?order_id=${orderId}`,
            notify_url: `${BACKEND_URL}/api/payments/payfast/itn`, // Your ITN webhook endpoint
            m_payment_id: orderId, // Unique payment ID for your system
            amount: parseFloat(amount).toFixed(2), // Format amount correctly
            item_name: itemName,
            item_description: itemDescription,
        };

        // 3. Generate Signature (using data *without* the signature field itself)
        const signature = generateSignature(paymentData, PAYFAST_PASSPHRASE);
        paymentData.signature = signature; // Add signature to the data object

        // 4. Send PayFast URL and payment data back to the frontend
        // The frontend will create and submit a form with this data.
        console.log('submitting data' , paymentData);
        res.json({
            payfastUrl: PAYFAST_PROCESS_URL,
            formData: paymentData
        });

    } catch (error) {
        console.error("Error creating PayFast payment:", error);
        // Consider deleting the created order if setup fails
        await Order.findByIdAndDelete(order._id); // If order was created before failure
        res.status(500).json({ error: error.message || 'Failed to initiate PayFast payment' });
    }
};


/**
 * PayFast ITN (Instant Transaction Notification) Handler
 */
exports.payfastItnWebhook = async (req, res) => {
    // Log raw ITN data for debugging
    console.log("Received PayFast ITN:", req.body);

    // 1. Extract ITN data
    const itnData = req.body;

    // 2. Send ITN data back to PayFast for validation
    try {
        const dataString = querystring.stringify(itnData); // Convert object back to query string
        console.log("Validating ITN data string:", dataString);

        const validationResponse = await axios.post(PAYFAST_VALIDATE_URL, dataString, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
             // Set a timeout to prevent hanging
             timeout: 15000 // 15 seconds
        });

        console.log("PayFast Validation Response Status:", validationResponse.status);
        console.log("PayFast Validation Response Body:", validationResponse.data);

        // 3. Check validation response
        if (validationResponse.data !== 'VALID') {
            console.error('PayFast ITN Validation Failed. Response:', validationResponse.data);
            // Respond 200 OK to PayFast even on validation failure to acknowledge receipt,
            // but don't process the order. Log the error for investigation.
            return res.status(200).send('ITN Received but Validation Failed');
        }

        // 4. ITN is VALID - Perform internal checks and update order
        console.log('PayFast ITN Validated Successfully.');

        const orderId = itnData.m_payment_id;
        const paymentStatus = itnData.payment_status;
        const receivedAmount = parseFloat(itnData.amount_gross);

        const order = await Order.findById(orderId);

        if (!order) {
            console.error(`Order not found for m_payment_id: ${orderId}`);
            return res.status(200).send('ITN Received but Order Not Found');
        }

        // Security Check: Verify amount matches
        if (order.amount !== receivedAmount) {
            console.error(`Amount mismatch for order ${orderId}. Expected: ${order.amount}, Received: ${receivedAmount}`);
            // Optionally update status to 'amount_mismatch' or similar
            await Order.findByIdAndUpdate(orderId, { status: 'amount_mismatch', paymentDetails: itnData });
            return res.status(200).send('ITN Received but Amount Mismatch');
        }

        // Security Check: Prevent processing already completed orders (optional but good practice)
         if (order.status === 'paid') {
            console.log(`Order ${orderId} already marked as paid. Ignoring duplicate ITN.`);
            return res.status(200).send('ITN Received for Already Paid Order');
        }

        // 5. Update order status based on PayFast status
        let newStatus = order.status; // Default to current status
        if (paymentStatus === 'COMPLETE') {
            newStatus = 'paid';
            console.log(`Payment successful for order: ${orderId}`);
        } else if (paymentStatus === 'FAILED') {
            newStatus = 'failed';
            console.log(`Payment failed for order: ${orderId}`);
        } else {
            console.log(`Unhandled PayFast payment status '${paymentStatus}' for order: ${orderId}`);
            // Optionally update status to reflect pending/other states if needed
            newStatus = `pf_${paymentStatus.toLowerCase()}`; // e.g., 'pf_pending'
        }

        // Store ITN details for reference (optional)
        await Order.findByIdAndUpdate(orderId, {
             status: newStatus,
             paymentDetails: itnData // Store the full ITN payload
        });

        // 6. Respond 200 OK to PayFast *only after successful processing*
        res.status(200).send('ITN Processed Successfully');

    } catch (error) {
        console.error('Error processing PayFast ITN:', error.response ? error.response.data : error.message);
        // Respond 200 OK to prevent PayFast retries, but log the internal error.
        res.status(200).send('ITN Received but Internal Server Error during processing');
    }
};


/**
 * Verify Payment Status (from Frontend)
 * Checks the order status in *your* database, which should have been updated by the ITN webhook.
 */
exports.verifyPayment = async (req, res) => {
    // Use order_id (which was our m_payment_id) passed back to frontend
    const { orderId } = req.body;

    if (!orderId) {
         return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check the status updated by the ITN handler
        if (order.status === 'paid') {
            res.status(200).json({ success: true, status: order.status, message: 'Payment successful' });
        } else if (order.status === 'failed' || order.status === 'amount_mismatch') {
             res.status(400).json({ success: false, status: order.status, message: 'Payment not successful' });
        } else {
            // Could be 'unpaid', 'pending', or other statuses
            res.status(200).json({ success: false, status: order.status, message: 'Payment status uncertain or pending' });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: 'Failed to verify payment status' });
    }
};


// const Order = require('../models/order.model');


// exports.createYocoPayment = async (req, res) => {
//   try {
//    const { amount } = req.body; 

//     const yocoSession = await fetch('https://payments.yoco.com/api/checkouts', {
//       method: 'POST',
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.YOCO_SECRET_KEY}`
//       },
//       body: JSON.stringify({ 
//         amount: amount * 100, 
//         currency: "ZAR",
//         successUrl: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`, 
//         cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,   
//         lineItems: [
//           {
//             "displayName": "Create Memorial",
//             "quantity": 1,
//             "pricingDetails": {
//               "price": amount * 100,
//             }
//           }
//         ],
//       }),
//     })

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Yoco API Error:", errorData);
//       throw new Error(`Yoco API request failed: ${response.statusText}`);
//   }

//     const yocoSessionData = await yocoSession.json();

//     const order = await Order.create({
//       checkoutId: yocoSessionData.id,
//       status: 'unpaid',
//       amount: amount,
//       userId: req.user.userId
//     });

//     res.json({ url: yocoSessionData.redirectUrl }); 
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.yocoWebhook = async (req, res) => {
//   const { event } = req.body;
//   const id = event.id;
//   const checkoutId = event.payload.metadata.checkoutId;

//   switch (event.type) {
//     case 'payment.succeeded':
//       console.log('Payment succeeded:', event);
      
//       const successOrder = await Order.findOneAndUpdate(
//         { checkoutId: checkoutId },
//         { status: 'paid' }
//       );

//       if (!successOrder) {
//         console.error('Order not found for checkoutId:', checkoutId);
//         return;
//       }

//       break;
//     case 'payment.failed':
//       console.log('Payment failed:', event);

//       const failedOrder = await Order.findOneAndUpdate(
//         { checkoutId: checkoutId }, 
//         { status: 'failed' }
//       );

//       if (!failedOrder) {
//         console.error('Order not found for checkoutId:', checkoutId);
//         return;
//       }

//       break;
//     default:
//       console.log('Unhandled event type:', event.type);
//   }

//   // Respond to Yoco with a 200 OK status
//   res.status(200);
// };

// // New endpoint to verify the payment 
// exports.verifyPayment = async (req, res) => {
//   const { checkoutId } = req.body; 

//   try {
//     const order = await Order.findOne({ checkoutId });

//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     if (order.status === 'paid') {
//       res.status(200).json({ success: true, message: 'Payment successful' });
//     } else {
//       res.status(400).json({ success: false, message: 'Payment not successful' });
//     }
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     res.status(500).json({ success: false, message: 'Failed to verify payment' });
//   }
// };
