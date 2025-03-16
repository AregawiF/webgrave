const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  sendFlowerTribute, 
  getMemorialTributes,
  completeFlowerTribute,
  handleWebhook 
} = require('../controllers/flower.controller');

// Public route to get tributes for a memorial
router.get('/:memorialId/tributes', getMemorialTributes);

// Protected routes for flower tributes
router.post('/send', authenticate, sendFlowerTribute);
router.post('/complete', authenticate, completeFlowerTribute);

// Stripe webhook - needs raw request body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
