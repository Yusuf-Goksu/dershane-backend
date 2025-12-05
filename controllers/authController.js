const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Kullanıcı kayıt
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(201).json(result);
});

// ⭐ Kullanıcı giriş
exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(200).json(result);
});
