const nodemailer = require('nodemailer');

// Create transporter with debug logging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SUPPORT_EMAIL_PASSWORD
  },
  debug: true // Enable debug logging
});

const sendVerificationEmail = async (email, otp) => {
  // Validate environment variables
  if (!process.env.SUPPORT_EMAIL || !process.env.SUPPORT_EMAIL_PASSWORD) {
    console.error('Email configuration missing. Please check your .env file.');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: process.env.SUPPORT_EMAIL,
    to: email,
    subject: 'Verify Your WebGrave Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to WebGrave</h2>
        <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="color: #6B7280; font-size: 14px;">This is an automated email, please do not reply.</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send verification email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
}; 