const teacherService = require('../services/teacherService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Öğrenciye deneme sonucu ekleme
exports.addExamResult = asyncHandler(async (req, res) => {
  const result = await teacherService.addExamResult(
    req.params.studentId,
    req.body,
    req.user
  );
  res.json(result);
});

// ⭐ Öğrencinin tüm denemelerini görüntüleme
exports.getStudentExams = asyncHandler(async (req, res) => {
  const result = await teacherService.getStudentExams(
    req.params.studentId,
    req.user
  );
  res.json(result);
});

// ⭐ Sınıf sıralaması
exports.getClassRanking = asyncHandler(async (req, res) => {
  const result = await teacherService.getClassRanking(
    req.params.className,
    req.user
  );
  res.json(result);
});
