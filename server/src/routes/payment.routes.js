const express = require('express');
const router = express.Router();
const {
  createPaypalOrder,
  capturePaypalOrder
} = require('../controllers/payment.controller');


router.post("/create-paypal-order", createPaypalOrder);

router.post("/capture-paypal-order", capturePaypalOrder);

module.exports = router;
