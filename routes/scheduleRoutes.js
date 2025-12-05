const express = require('express');
const router = express.Router();

const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Yaklaşan etkinlikler
router.get(
  '/upcoming/:className',
  authenticateToken,
  scheduleController.getUpcomingEvents
);

// En yakın etkinlik
router.get(
  '/next/:className',
  authenticateToken,
  scheduleController.getNextEvent
);

// Yeni etkinlik oluşturma
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  scheduleController.createEvent
);

// Tüm etkinlikleri listeleme
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  scheduleController.getAllEvents
);

module.exports = router;
