const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  submitContactForm, 
  getContactSubmissions 
} = require('../controllers/contact.controller');

// Public route to submit contact form
router.post('/', submitContactForm);

// Protected route to get contact submissions (admin only)
router.get('/', authenticate, getContactSubmissions);

module.exports = router;
