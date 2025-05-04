const Flower = require('../models/flower.model');
const Memorial = require('../models/memorial.model');
const mongoose = require('mongoose'); // Add this line to import mongoose

const sendFlowerTribute = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        redirectToLogin: true 
      });
    }

    const { memorialId, amount, message } = req.body;
    console.log('flower details', memorialId, amount, message);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const memorial = await Memorial.findById(memorialId);
    if (!memorial) {
      return res.status(404).json({ error: 'Memorial not found' });
    }

    if (!memorial.enableDigitalFlowers) {
      return res.status(400).json({ error: 'Digital flowers are not enabled for this memorial' });
    }
    const senderId = req.user?.userId || userId;

    // Create the flower tribute and update memorial in a single transaction
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Create flower tribute
      const tribute = new Flower({
        memorialId,
        senderId,
        amount,
        message: message,
      });
      await tribute.save({ session });

      // Update memorial
      await Memorial.findByIdAndUpdate(
        memorialId,
        { 
          $push: { tributes: { 
            message: message,
            amount,
            senderId: senderId,
          }},
          $inc: { 'totalTributes.amount': amount, 'totalTributes.count': 1 }
        },
        { session }
      );

      await session.commitTransaction();
      
      return res.status(200).json({
        success: true,
        tribute: tribute.toObject(),
        message: 'Flower tribute sent successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
        error: 'Failed to send flower tribute. Please try again.',
        details: error.message
      });
    } finally {
      session.endSession();
    }

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
