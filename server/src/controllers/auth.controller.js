const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Memorial = require('../models/memorial.model');
const { sendVerificationEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        return res.status(400).json({ 
          message: 'Email not verified',
          userId: existingUser._id,
          isUnverified: true
        });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    // Send OTP via email
    try {
      await sendVerificationEmail(email, otp);
      res.status(201).json({ 
        message: 'User registered successfully. Please verify your email.',
        userId: user._id
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(user._id);
      res.status(500).json({ 
        message: 'Error sending verification email',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Log login attempt

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for unverified user
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      user.otpAttempts = 0;
      await user.save();

      // Send new verification email
      try {
        await sendVerificationEmail(user.email, otp);
        return res.status(403).json({ 
          message: 'Please verify your email first',
          userId: user._id,
          isUnverified: true
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return res.status(500).json({ 
          message: 'Error sending verification email',
          error: emailError.message 
        });
      }
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', user._id); // Log successful login

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error details:', error); // Detailed error logging
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const memorials = await Memorial.find({ createdBy: req.user.userId })
      .select('fullName mainPicture createdAt id')
      .sort({ createdAt: -1 });

    res.json({
      user,
      memorials
    });
  } catch (error) {
    console.error('Get profile error details:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
};

// Delete user profile
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete profile had errors:', error); // Detailed error logging
    res.status(500).json({ 
      message: 'Error deleting profile',
      error: error.message 
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Check if OTP is expired
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 3) {
      const timeSinceLastAttempt = Date.now() - user.lastOtpAttempt;
      if (timeSinceLastAttempt < 15 * 60 * 1000) { // 15 minutes
        return res.status(429).json({ 
          message: 'Too many failed attempts. Please try again in 15 minutes.',
          remainingTime: Math.ceil((15 * 60 * 1000 - timeSinceLastAttempt) / 1000)
        });
      }
      // Reset attempts after 15 minutes
      user.otpAttempts = 0;
    }

    // Verify OTP
    const isOtpValid = await user.matchOtp(otp);
    if (!isOtpValid) {
      user.otpAttempts += 1;
      user.lastOtpAttempt = Date.now();
      await user.save();

      const remainingAttempts = 3 - user.otpAttempts;
      return res.status(400).json({ 
        message: 'Invalid OTP',
        remainingAttempts,
        isBlocked: remainingAttempts <= 0
      });
    }

    // Activate user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.lastOtpAttempt = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying OTP',
      error: error.message 
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Check cooldown period (10 seconds)
    if (user.lastOtpSent && Date.now() - user.lastOtpSent < 10000) {
      const remainingTime = Math.ceil((10000 - (Date.now() - user.lastOtpSent)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} seconds before requesting a new code`,
        remainingTime
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOtpSent = Date.now();
    user.otpAttempts = 0; // Reset attempts when new OTP is sent
    await user.save();

    // Send new OTP via email
    try {
      await sendVerificationEmail(user.email, otp);
      res.status(200).json({ 
        message: 'New OTP sent successfully',
        userId: user._id,
        cooldownEndsAt: Date.now() + 10000 // 10 seconds from now
      });
    } catch (emailError) {
      console.error('Error sending new OTP:', emailError);
      res.status(500).json({ 
        message: 'Error sending new OTP',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      message: 'Error resending OTP',
      error: error.message 
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    user.lastOtpSent = new Date();
    await user.save();

    // Send OTP via email
    try {
      await sendVerificationEmail(email, otp);
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send reset instructions' });
    }

    res.status(200).json({ 
      message: 'Password reset instructions sent to your email',
      userId: user._id
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      // Increment OTP attempts
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 3) {
        return res.status(403).json({ 
          message: 'Too many failed attempts. Please request a new OTP.',
          tooManyAttempts: true
        });
      }

      return res.status(400).json({ 
        message: 'Invalid OTP',
        remainingAttempts: 3 - user.otpAttempts
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  deleteProfile,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword
};

