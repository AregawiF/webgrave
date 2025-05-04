const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');


const {
    initiatePaystackOrder,
    initiateMemorialOrder,
    verifyPaystackPayment 
} = require('../controllers/payment.controller');



router.post('/initiate-paystack-order', authenticate, initiatePaystackOrder);

router.post('/initiate-memorial-order', authenticate, initiateMemorialOrder);

router.post('/verify-paystack', authenticate, verifyPaystackPayment);


module.exports = router;