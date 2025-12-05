const Student = require('../models/Student');
const Parent = require('../models/Parent');
const AppError = require('../utils/AppError');
const notificationManager = require('./notification/notificationManager');

class StudentService {

  // ⭐ Öğrenci profilini getir
  async getStudentProfile(currentUser, userId) {
    const student = await Student.findOne({ user: userId }).populate('user', '-password');

    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    // Erişim kontrolü
    if (currentUser.role === 'student' && currentUser._id.toString() !== userId) {
      throw new AppError("Bu veriyi görme yetkiniz yok", 403);
    }

    return student;
  }

  // ⭐ Devamsızlık ekle
  async addAttendance(userId, data) {
    const { date, present } = data;

    const student = await Student.findOne({ user: userId }).populate('user', 'name email');
    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    const attendanceDate = date ? new Date(date) : new Date();

    student.attendance.push({ date: attendanceDate, present });
    await student.save();

    // ❗ GELMEMİŞSE → VELİYE BİLDİRİM
    if (present === false) {
      const parents = await Parent.find({ students: student._id }).populate('user', 'email name');

      const studentName = student.user.name;
      const formattedDate = attendanceDate.toLocaleDateString('tr-TR');

      for (const parent of parents) {
        await notificationManager.sendAttendanceWarning(
          parent.user._id,
          studentName,
          formattedDate
        );
      }
    }

    return {
      message: "Devamsızlık kaydedildi",
      attendance: student.attendance
    };
  }

  // ⭐ Deneme özeti getir
  async getExamSummary(userId) {
    const student = await Student.findOne({ user: userId });
    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    const exams = student.exams || [];
    const totalExams = exams.length;

    const avgNet =
      totalExams > 0
        ? exams.reduce((sum, exam) => sum + (exam.totalNet || 0), 0) / totalExams
        : 0;

    const recentExams = exams
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(exam => ({
        title: exam.title,
        date: exam.date,
        difficulty: exam.difficulty,
        totalNet: exam.totalNet
      }));

    return {
      studentId: userId,
      totalExams,
      avgNet: avgNet.toFixed(2),
      recentExams
    };
  }

  // ⭐ Öğrenciye sınıf atama
  async assignClass(userId, className) {
    const student = await Student.findOne({ user: userId });
    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    student.className = className;
    await student.save();

    return { message: "Sınıf atandı", student };
  }

  // ⭐ Sınıf sıralaması getir
  async getClassRanking(className) {
    const students = await Student.find({ className }).populate('user', 'name email');
    if (!students || students.length === 0) {
      throw new AppError("Bu sınıfta öğrenci bulunamadı", 404);
    }

    const results = students.map(s => {
      const lastExam = s.exams.length > 0 ? s.exams[s.exams.length - 1] : null;
      return {
        studentId: s.user._id,
        name: s.user.name,
        className: s.className,
        totalNet: lastExam ? lastExam.totalNet || 0 : 0
      };
    });

    // Net’e göre sıralama
    results.sort((a, b) => b.totalNet - a.totalNet);
    results.forEach((r, i) => (r.rankInClass = i + 1));

    return results;
  }
}

module.exports = new StudentService();
