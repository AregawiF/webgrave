const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
  memorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memorial',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Allow anonymous tributes
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Flower = mongoose.model('Flower', flowerSchema); 
module.exports = Flower;