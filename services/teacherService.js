const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const notificationManager = require('./notification/notificationManager');

class TeacherService {

  // ⭐ SINAV EKLEME
  async addExamResult(studentUserId, examData, currentUser) {
    const { title, date, difficulty, subjects } = examData;

    const student = await Student.findOne({ user: studentUserId }).populate('user', 'name email');
    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    // 🔹 Öğretmen sadece kendi sınıfındaki öğrenciye işlem yapabilir
    if (currentUser.role === "teacher" && student.className !== currentUser.className) {
      throw new AppError("Bu öğrenci sizin sınıfınızda değil.", 403);
    }

    // 🔹 NET HESABI (correct - wrong / 4)
    let totalNet = 0;

    if (Array.isArray(subjects)) {
      subjects.forEach(sub => {
        const correct = sub.correct || 0;
        const wrong = sub.wrong || 0;

        const net = correct - wrong / 4;
        sub.net = parseFloat(net.toFixed(2));

        totalNet += net;
      });
    }

    totalNet = parseFloat(totalNet.toFixed(2));

    // 🔹 Öğrenciye deneme ekle
    student.exams.push({
      title,
      date: date ? new Date(date) : new Date(),
      difficulty,
      subjects,
      totalNet
    });

    await student.save();

    // 🔹 Bildirim gönder
    await notificationManager.sendExamResult(
      student.user._id,
      title,
      totalNet
    );

    return {
      message: "Deneme sonucu eklendi",
      exams: student.exams
    };
  }

  // ⭐ SINAV LİSTELEME
  async getStudentExams(studentUserId, currentUser) {
    const student = await Student.findOne({ user: studentUserId }).populate('user');

    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    // 🔹 Öğretmen yalnızca kendi sınıfındaki öğrenciyi görebilir
    if (currentUser.role === "teacher" && student.className !== currentUser.className) {
      throw new AppError("Bu öğrenci sizin sınıfınızda değil.", 403);
    }

    return { exams: student.exams };
  }

  // ⭐ SINIF SIRALAMASI
  async getClassRanking(className, currentUser) {
    // 🔹 Öğretmen kendi sınıfı dışındaki sıralamayı göremez
    if (currentUser.role === "teacher" && currentUser.className !== className) {
      throw new AppError("Bu sınıf sizin sorumluluğunuzda değil.", 403);
    }

    const students = await Student.find({ className }).populate('user', 'name email');

    if (!students.length) {
      throw new AppError("Bu sınıfta öğrenci yok.", 404);
    }

    const results = students.map(s => {
      const lastExam = s.exams?.length ? s.exams[s.exams.length - 1] : null;

      return {
        studentId: s.user._id,
        name: s.user.name,
        className: s.className,
        totalNet: lastExam?.totalNet ?? 0,
      };
    });

    // Net’e göre sıralama
    results.sort((a, b) => b.totalNet - a.totalNet);

    // Rank numarası ekleme
    results.forEach((r, i) => (r.rankInClass = i + 1));

    return results;
  }

}

module.exports = new TeacherService();
