const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const multerUpload = require('../middleware/multer');
const {
  createMemorial,
  getAllMemorials,
  getMemorialById,
  updateMemorial,
  deleteMemorial,
} = require('../controllers/memorial.controller');

// Public routes (no authentication)
router.get('/', getAllMemorials);
router.get('/:id', getMemorialById);

// Protected routes (authentication required)
router.post('/', authenticate, multerUpload.fields([{ name: 'mainPicture', maxCount: 1 }, { name: 'additionalMedia', maxCount: 10 }]), createMemorial);
router.put('/:id', authenticate, multerUpload.fields([{ name: 'mainPicture', maxCount: 1 }, { name: 'additionalMedia', maxCount: 10 }]), updateMemorial);
router.delete('/:id', authenticate, deleteMemorial);

module.exports = router;
