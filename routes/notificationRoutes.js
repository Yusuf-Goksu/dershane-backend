const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// FCM token kaydet
router.post(
  '/register-token',
  authenticateToken,
  notificationController.registerToken
);

// FCM token sil (çıkış yapan kullanıcı için)
router.delete(
  '/remove-token',
  authenticateToken,
  notificationController.removeToken
);

module.exports = router;
