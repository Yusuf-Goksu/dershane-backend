const scheduleService = require('../services/scheduleService');
const asyncHandler = require('../middleware/asyncHandler');

// ⭐ Yaklaşan etkinlikleri getir
exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const data = await scheduleService.getUpcomingEvents(req.params.className);
  res.json(data);
});

// ⭐ En yakın etkinliği getir (dashboard için)
exports.getNextEvent = asyncHandler(async (req, res) => {
  const data = await scheduleService.getNextEvent(req.params.className);
  res.json(data);
});

// ⭐ Yeni etkinlik oluştur
exports.createEvent = asyncHandler(async (req, res) => {
  const data = await scheduleService.createEvent(req.body, req.user);
  res.status(201).json(data);
});

// ⭐ Tüm etkinlikleri listele
exports.getAllEvents = asyncHandler(async (req, res) => {
  const data = await scheduleService.getAllEvents();
  res.json(data);
});
