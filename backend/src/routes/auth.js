const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  registerTenant,
  login,
  getCurrentUser,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', registerTenant);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;
