const Flower = require('../models/flower.model');
const Memorial = require('../models/memorial.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Send flower tribute with payment
const sendFlowerTribute = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        redirectToLogin: true 
      });
    }

    const { memorialId, amount, message } = req.body;
    
    // Validate amount is a number and greater than 0
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Validate memorial exists
    const memorial = await Memorial.findById(memorialId);
    if (!memorial) {
      return res.status(404).json({ error: 'Memorial not found' });
    }

    // Check if digital flowers are enabled for this memorial
    if (!memorial.enableDigitalFlowers) {
      return res.status(400).json({ error: 'Digital flowers are not enabled for this memorial' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Flower Tribute for ${memorial.fullName}'s Memorial`,
              description: message || 'Digital flower tribute'
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/flower-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/flower-payment/cancel?memorial_id=${memorialId}`,
      metadata: {
        memorialId,
        userId: req.user.userId,
        type: 'flower_tribute'
      }
    });

    // Return checkout URL to client
    res.status(200).json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Flower tribute error:', error);
    res.status(500).json({ error: 'Payment processing failed. Please try again or contact support.' });
  }
};

// Complete flower tribute after payment verification
const completeFlowerTribute = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Retrieve session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
    
    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Extract metadata
    const { memorialId, userId, type } = session.metadata;
    
    // Verify this is for flower tribute
    if (type !== 'flower_tribute') {
      return res.status(400).json({ error: 'Invalid session type' });
    }
    
    // Get payment intent ID (not the whole object)
    const paymentIntentId = session.payment_intent.id || session.payment_intent;

    // Check if this transaction has already been processed
    const existingTribute = await Flower.findOne({ transactionId: paymentIntentId });
    if (existingTribute) {
      return res.json({
        success: true,
        message: 'Payment already processed',
        tribute: existingTribute
      });
    }

    // Find memorial
    const memorial = await Memorial.findById(memorialId);
    if (!memorial) {
      return res.status(404).json({ error: 'Memorial not found' });
    }

    // Calculate amount in dollars (stripe amount is in cents)
    const amount = session.amount_total / 100;

    let tribute;
    
    // Get the message from the line items description or use a default
    const message = session.line_items?.data[0]?.description || 'Digital flower tribute';

    console.log('flower message:', session.line_items)
    // Get the senderId from the request user or use the one from metadata
    const senderId = req.user?.userId || userId;

    // Create new flower tribute record
    tribute = new Flower({
      memorialId,
      senderId: senderId,
      amount,
      message: message,
      transactionId: paymentIntentId
    });

    await tribute.save();

    // Update memorial total tributes
    await Memorial.findByIdAndUpdate(
      memorialId,
      { 
        $push: { tributes: { 
          message: message,
          amount,
          senderId: senderId,
          isAnonymous: !req.user
        }},
        $inc: { 'totalTributes.amount': amount, 'totalTributes.count': 1 }
      }
    );

    // Get memorial name to display on success page
    const memorialName = memorial.fullName;
    
    res.status(200).json({
      success: true,
      tribute,
      memorialName,
      message: 'Flower tribute verified successfully'
    });
  } catch (error) {
    console.error('Complete flower tribute error:', error);
    res.status(500).json({ error: 'Payment verification failed. Please try again or contact support.' });
  }
};

// Get tributes for a memorial
const getMemorialTributes = async (req, res) => {
  try {
    const { memorialId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Find memorial
    const memorial = await Memorial.findById(memorialId)
      .populate({
        path: 'tributes.senderId',
        select: 'name email'
      });
    
    if (!memorial) {
      return res.status(404).json({ error: 'Memorial not found' });
    }
    
    // Sort tributes by date (newest first)
    const sortedTributes = [...memorial.tributes].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTributes = sortedTributes.slice(startIndex, endIndex);
    
    res.status(200).json({
      tributes: paginatedTributes,
      totalPages: Math.ceil(sortedTributes.length / limit),
      currentPage: Number(page),
      totalItems: sortedTributes.length,
      totalAmount: memorial.totalTributes.amount
    });
  } catch (error) {
    console.error('Get memorial tributes error:', error);
    res.status(500).json({ error: 'Failed to retrieve tributes. Please try again or contact support.' });
  }
};

// Webhook for Stripe events (optional but recommended)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Check if this is a flower tribute payment
    if (session.metadata && session.metadata.type === 'flower_tribute') {
      try {
        // Process the flower tribute
        await handleCompletedFlowerPayment(session);
      } catch (error) {
        console.error('Error processing webhook payment:', error);
      }
    }
  }

  res.status(200).send({ received: true });
};

// Helper function for webhook
const handleCompletedFlowerPayment = async (session) => {
  const { memorialId, userId } = session.metadata;
  const amount = session.amount_total / 100;
  
  // Check if a tribute with this transaction ID already exists
  const existingTribute = await Flower.findOne({ transactionId: session.payment_intent.id || session.payment_intent });
  
  if (existingTribute) {
    console.log('Webhook: Found existing tribute, skipping creation', existingTribute._id);
    return existingTribute;
  }
  
  // Create flower record
  const tribute = new Flower({
    memorialId,
    sender: userId,
    amount,
    transactionId: session.payment_intent.id || session.payment_intent
  });
  
  await tribute.save();
  
  // Update memorial record
  const memorial = await Memorial.findById(memorialId);
  if (memorial) {
    memorial.tributes.push({
      message: session.line_items?.[0]?.description || 'Digital flower tribute',
      amount,
      senderId: userId,
      date: new Date(),
      isAnonymous: false
    });
    
    memorial.updateTotalTributes();
    await memorial.save();
  }
};

module.exports = {
  sendFlowerTribute,
  completeFlowerTribute,
  getMemorialTributes,
  handleWebhook
};
