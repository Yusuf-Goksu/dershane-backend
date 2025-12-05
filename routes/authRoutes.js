const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// PUBLIC ROUTES

// Sadece admin user oluşturabilir
router.post(
  '/register',
  authenticateToken,
  authorizeRoles('admin'),
  authController.register
);

// Giriş herkese açık
router.post('/login', authController.login);

module.exports = router;
