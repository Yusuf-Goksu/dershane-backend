const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Öğrenci profilini getir
router.get('/:id', authenticateToken, studentController.getStudentProfile);

// Devamsızlık ekle
router.post('/:id/attendance',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  studentController.addAttendance
);

// Deneme özeti
router.get('/:id/exam-summary', authenticateToken, studentController.getExamSummary);

// Öğrenciye sınıf ata
router.put('/:id/assign-class',
  authenticateToken,
  authorizeRoles('admin'),
  studentController.assignClass
);

// Sınıf sıralaması
router.get('/class-ranking/:className',
  authenticateToken,
  studentController.getClassRanking
);

module.exports = router;