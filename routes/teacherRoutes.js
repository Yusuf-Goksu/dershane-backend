const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Öğrenciye deneme sonucu ekle
router.post(
  '/:studentId/exams',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  teacherController.addExamResult
);

// Öğrencinin tüm denemelerini getir
router.get(
  '/:studentId/exams',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  teacherController.getStudentExams
);

// Sınıf sıralaması
router.get(
  '/class-ranking/:className',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  teacherController.getClassRanking
);

module.exports = router;
