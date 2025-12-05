const mongoose = require('mongoose');

// Deneme sınavı alt şeması
const examSchema = new mongoose.Schema({
  title: String,
  date: Date,
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  subjects: [{ subjectName: String, correct: Number, wrong: Number, blank: Number }],
  totalNet: Number
});

// Devamsızlık alt şeması
const attendanceSchema = new mongoose.Schema({
  date: Date,
  present: { type: Boolean, default: true }
});

// Ana öğrenci şeması
const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: String,
  exams: [examSchema],
  attendance: [attendanceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
