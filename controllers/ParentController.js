const parentService = require('../services/ParentService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Veliye öğrenci ekleme
exports.addStudentToParent = asyncHandler(async (req, res) => {
  const result = await parentService.addStudentToParent(
    req.params.parentId,
    req.params.studentId
  );
  res.json(result);
});

// ⭐ Veli kendi öğrencilerini görüntüleme
exports.getMyStudents = asyncHandler(async (req, res) => {
  const result = await parentService.getMyStudents(req.user._id, req.user.role);
  res.json(result);
});
