const mongoose = require('mongoose');

const memorialSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deceased: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    dateOfBirth: Date,
    dateOfDeath: Date,
    biography: String
  },
  photos: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  videos: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  tributes: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalTributes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

// Update the updatedAt timestamp before saving
memorialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create text indexes for search
memorialSchema.index({
  'deceased.firstName': 'text',
  'deceased.lastName': 'text',
  'deceased.biography': 'text'
});

module.exports = mongoose.model('Memorial', memorialSchema);
