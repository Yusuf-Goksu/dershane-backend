const express = require('express');
const router = express.Router();

const newsController = require('../controllers/newsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Haber ekleme (admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  newsController.createNews
);

// Tüm haberleri getir (public)
router.get(
  '/',
  newsController.getAllNews
);

module.exports = router;
