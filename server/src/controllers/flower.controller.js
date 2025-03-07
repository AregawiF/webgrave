const Flower = require('../models/flower.model');
const Memorial = require('../models/memorial.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Send a digital flower tribute
exports.sendFlowerTribute = async (req, res) => {
  try {
    const { 
      memorialId, 
      amount, 
      message, 
      paymentMethod, 
      token 
    } = req.body;

    // Validate memorial exists
    const memorial = await Memorial.findById(memorialId);
    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    // Process payment based on payment method
    let paymentIntent;
    try {
      if (paymentMethod === 'stripe') {
        paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100,  // Convert to cents
          currency: 'usd',
          payment_method: token,
          confirm: true
        });
      } else {
        // Add PayPal payment processing logic here
        return res.status(400).json({ message: 'PayPal not yet implemented' });
      }
    } catch (paymentError) {
      return res.status(400).json({ 
        message: 'Payment processing failed', 
        error: paymentError.message 
      });
    }

    // Create flower tribute
    const flowerTribute = new Flower({
      memorial: memorialId,
      sender: req.user ? req.user.id : null,
      amount,
      message,
      paymentMethod,
      paymentStatus: 'completed',
      transactionId: paymentIntent.id
    });

    await flowerTribute.save();

    // Update memorial's total tributes
    memorial.totalTributes += amount;
    await memorial.save();

    res.status(201).json({
      message: 'Flower tribute sent successfully',
      tribute: flowerTribute
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get flower tributes for a specific memorial
exports.getMemorialTributes = async (req, res) => {
  try {
    const { memorialId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const tributes = await Flower.find({ memorial: memorialId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Flower.countDocuments({ memorial: memorialId });

    res.json({
      tributes,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
