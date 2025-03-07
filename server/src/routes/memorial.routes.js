const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  createMemorial,
  getAllMemorials,
  getMemorialById,
  updateMemorial,
  deleteMemorial,
  updateMemorialStatus
} = require('../controllers/memorial.controller');

// Public routes (no authentication)
router.get('/', getAllMemorials);
router.get('/:id', getMemorialById);

// Protected routes (authentication required)
router.post('/', authenticate, createMemorial);
router.put('/:id', authenticate, updateMemorial);
router.delete('/:id', authenticate, deleteMemorial);
router.patch('/:id/status', authenticate, updateMemorialStatus);

module.exports = router;
