const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// Tributes management
router.get('/tributes', adminController.getAllTributes);

// User management
router.get('/users', adminController.getAllUsers);

// Get user profile
router.get('/users/:id', adminController.adminGetUserProfile);

// Delete user
router.delete('/users/:id', adminController.adminDeleteProfile);

// Delete tribute
router.delete('/tributes/:id', adminController.adminDeleteTribute);

module.exports = router;
