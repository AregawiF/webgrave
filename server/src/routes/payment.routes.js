const express = require('express');
const router = express.Router();

const {
  verifyPayment,
  createStripePayment
} = require('../controllers/payment.controller');

router.post('/create-stripe-payment', createStripePayment);
router.post('/verifyPayment', verifyPayment);

// router.post("/create-paypal-order", createPaypalOrder);
// router.post("/capture-paypal-order", capturePaypalOrder);

module.exports = router;
