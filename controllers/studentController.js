const studentService = require('../services/studentService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Öğrenci profilini getir
exports.getStudentProfile = asyncHandler(async (req, res) => {
  const result = await studentService.getStudentProfile(req.user, req.params.id);
  res.json(result);
});

// ⭐ Devamsızlık ekleme
exports.addAttendance = asyncHandler(async (req, res) => {
  const result = await studentService.addAttendance(req.params.id, req.body);
  res.json(result);
});

// ⭐ Deneme özet bilgisi
exports.getExamSummary = asyncHandler(async (req, res) => {
  const result = await studentService.getExamSummary(req.params.id);
  res.json(result);
});

// ⭐ Sınıf atama
exports.assignClass = asyncHandler(async (req, res) => {
  const result = await studentService.assignClass(req.params.id, req.body.className);
  res.json(result);
});

// ⭐ Sınıf sıralaması
exports.getClassRanking = asyncHandler(async (req, res) => {
  const result = await studentService.getClassRanking(req.params.className);
  res.json(result);
});
