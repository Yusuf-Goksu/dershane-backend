const userService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Şifre değiştirme
exports.changePassword = asyncHandler(async (req, res) => {
  const result = await userService.changePassword(req.user._id, req.body);
  return res.status(200).json(result);
});

;
