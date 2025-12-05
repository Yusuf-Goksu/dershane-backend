const notificationService = require('../services/notificationService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Kullanıcı cihazı için FCM token kaydet
exports.registerToken = asyncHandler(async (req, res) => {
  const result = await notificationService.registerToken(req.user._id, req.body);
  res.json(result);
});

// ⭐ Kullanıcı cihazı token sil (logout için)
exports.removeToken = asyncHandler(async (req, res) => {
  const result = await notificationService.removeToken(req.user._id, req.body?.token);
  res.json(result);
});
