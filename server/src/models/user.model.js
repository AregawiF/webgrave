const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.isVerified; // Only required if user is verified
    }
  },
  firstName: {
    type: String,
    required: function() {
      return this.isVerified; // Only required if user is verified
    },
    trim: true
  },
  lastName: {
    type: String,
    required: function() {
      return this.isVerified; // Only required if user is verified
    },
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  lastOtpAttempt: {
    type: Date
  },
  lastOtpSent: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bankAccount: {
    accountHolder: String,
    accountNumber: String,
    bankName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Compare OTP method
userSchema.methods.matchOtp = async function(candidateOtp) {
  return this.otp === candidateOtp;
};

// Method to hash OTP before saving (optional but good practice)
userSchema.methods.hashOtp = async function (otp) {
  const salt = await bcrypt.genSalt(5); // Less rounds for OTP is fine
  return await bcrypt.hash(otp, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
