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
    const senderId = req.user?.userId || userId;

    tribute = new Flower({
      memorialId,
      senderId: senderId,
      amount,
      message: message,
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

module.exports = {
  sendFlowerTribute,
  getMemorialTributes
};
