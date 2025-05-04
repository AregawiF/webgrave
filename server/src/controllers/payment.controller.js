const axios = require('axios');
const Order = require('../models/order.model'); 
const User = require('../models/user.model');
const Memorial = require('../models/memorial.model'); // Added Memorial model


exports.initiatePaystackOrder = async (req, res) => {
    const { amount, orderType, memorialId, tributeMessage } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount." });
    }

    const order = await Order.create({
        status: 'unpaid',
        orderType,
        amount,
        userId,
        memorialId,
    });

    const user = await User.findById(userId); 

    res.status(200).json({
        orderId: order._id.toString(),
        email: user.email,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        amountInUSD: parseInt(amount * 100)
    });
};

exports.initiateMemorialOrder = async (req, res) => {
    const { amount, orderType } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount." });
    }

    const order = await Order.create({
        status: 'unpaid',
        orderType,
        amount,
        userId,
    });

    const user = await User.findById(userId); 

    res.status(200).json({
        orderId: order._id.toString(),
        email: user.email,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        amountInUSD: parseInt(amount * 100)
    });
}

exports.verifyPaystackPayment = async (req, res) => {
    const { reference, orderId } = req.body;

    if (!reference || !orderId) {
        return res.status(400).json({ error: 'Missing reference or order ID' });
    }

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const data = response.data;

        if (data.status && data.data.status === 'success') {
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Check if memorial already exists for this order
            const existingMemorial = await Memorial.findOne({ orderId: orderId });
            if (existingMemorial) {
                order.status = 'paid';
                order.paymentDetails = data.data; 
                await order.save();
                return res.json({ 
                    success: true, 
                    message: 'Payment verified',
                    memorialId: existingMemorial._id
                });
            }

            // Update order status
            order.status = 'paid';
            order.paymentDetails = data.data; 
            await order.save();

            // Return success without creating memorial - this will be handled by PaymentSuccess component
            return res.json({ 
                success: true, 
                message: 'Payment verified',
                orderId: orderId
            });
        } else {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }
    } catch (err) {
        console.error("Verification error:", err.message);
        return res.status(500).json({ success: false, message: 'Verification failed' });
    }
};
