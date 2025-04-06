const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  sendFlowerTribute, 
  getMemorialTributes
} = require('../controllers/flower.controller');

// Public route to get tributes for a memorial
router.get('/:memorialId/tributes', getMemorialTributes);

// Protected routes for flower tributes
router.post('/send', authenticate, sendFlowerTribute);

module.exports = router;
