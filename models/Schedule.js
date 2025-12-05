const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Etkinlik başlığı
  date: { type: Date, required: true },    // Etkinlik tarihi
  type: { type: String, enum: ['exam', 'lesson', 'meeting'], default: 'lesson' }, // tür
  className: { type: String, required: true }, // Hangi sınıfa ait (örn: 11A)
  description: { type: String }, // İsteğe bağlı açıklama
});

module.exports = mongoose.model('Schedule', scheduleSchema);