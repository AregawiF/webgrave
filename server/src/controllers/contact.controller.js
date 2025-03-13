const Contact = require('../models/contact.model');
const nodemailer = require('nodemailer');

// Create a new contact form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create contact submission
    const contactSubmission = new Contact({
      name,
      email,
      subject,
      message
    });

    await contactSubmission.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.SUPPORT_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>WebGrave New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      submission: contactSubmission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get contact form submissions (admin only)
exports.getContactSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};

    const submissions = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
