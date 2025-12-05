const newsService = require('../services/newsService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Haber oluştur
exports.createNews = asyncHandler(async (req, res) => {
  const result = await newsService.createNews(req.body, req.user);
  res.status(201).json(result);
});

// ⭐ Tüm haberleri listele
exports.getAllNews = asyncHandler(async (req, res) => {
  const result = await newsService.getAllNews();
  res.json(result);
});
