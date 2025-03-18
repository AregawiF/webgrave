const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const multerUpload = require('../middleware/multer');
const {
  createMemorial,
  getAllMemorials,
  getMyMemorials,
  getMemorialById,
  updateMemorial,
  deleteMemorial,
  addMedia,
} = require('../controllers/memorial.controller');

// Public routes (no authentication)
router.get('/', getAllMemorials);
router.get('/my-memorials', authenticate, getMyMemorials);

router.get('/:id', getMemorialById);
// Protected routes (authentication required)
router.post('/', authenticate, multerUpload.fields([{ name: 'mainPicture', maxCount: 1 }, { name: 'additionalMedia', maxCount: 10 }]), createMemorial);
router.put('/:id', authenticate, multerUpload.fields([{ name: 'mainPicture', maxCount: 1 }, { name: 'additionalMedia', maxCount: 10 }]), updateMemorial);
router.delete('/:id', authenticate, deleteMemorial);
router.put('/media/:id', authenticate, multerUpload.fields([{ name: 'additionalMedia', maxCount: 10 }]), addMedia);

module.exports = router;
