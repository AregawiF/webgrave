// const express = require('express');
// const router = express.Router();

// const {
//   verifyPayment,
//   createYocoPayment,
//   yocoWebhook
// } = require('../controllers/payment.controller');

// router.post('/create-yoco-payment', createYocoPayment);
// router.post('/verifyPayment', verifyPayment);
// router.post('/yoco/webhook', yocoWebhook);


// module.exports = router;


const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');


const {
    createPayfastPayment,
    payfastItnWebhook,
    verifyPayment // Keep verifyPayment as is conceptually
} = require('../controllers/payment.controller');

// Route to prepare PayFast payment data
// Might need authentication middleware
router.post('/create-payfast-payment', authenticate, createPayfastPayment);

// Route for PayFast ITN notifications (NO AUTH MIDDLEWARE HERE - PayFast calls this)
// Ensure body-parser for x-www-form-urlencoded is enabled in your main app.js/server.js
// e.g., app.use(express.urlencoded({ extended: true }));
router.post('/payfast/itn', payfastItnWebhook);

// Route for frontend to verify payment status from your DB
// Might need authentication middleware
router.post('/verify-payment', authenticate, verifyPayment);


module.exports = router;