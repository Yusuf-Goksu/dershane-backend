const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.put('/change-password', authenticateToken, userController.changePassword);

module.exports = router;
