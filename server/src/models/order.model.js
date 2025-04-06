const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'amount_mismatch'],
    default: 'unpaid'
  },
  orderType: {
    type: String,
    enum: ['memorial_creation', 'flower_tribute'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memorial',
    required: function() {
      return this.orderType === 'flower_tribute';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);