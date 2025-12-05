const express = require('express');
const router = express.Router();

const parentController = require('../controllers/ParentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Admin veliye öğrenci ekler
router.post(
  '/:parentId/add-student/:studentId',
  authenticateToken,
  authorizeRoles('admin'),
  parentController.addStudentToParent
);

// Veli kendi öğrencilerini görür
router.get(
  '/my-students',
  authenticateToken,
  authorizeRoles('parent'),
  parentController.getMyStudents
);

module.exports = router;
