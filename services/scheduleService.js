const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const notificationManager = require('./notification/notificationManager');

class ScheduleService {

  // ⭐ Yaklaşan etkinlikler
  async getUpcomingEvents(className) {
    if (!className) {
      throw new AppError("Sınıf adı gerekli", 400);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const events = await Schedule.find({
      className,
      date: { $gte: todayStart }
    })
      .sort({ date: 1 })
      .lean();

    if (!events.length) {
      throw new AppError("Yaklaşan etkinlik bulunamadı", 404);
    }

    return events;
  }

  // ⭐ En yakın etkinlik
  async getNextEvent(className) {
    if (!className) {
      throw new AppError("Sınıf adı gerekli", 400);
    }

    const now = new Date();

    const event = await Schedule.findOne({
      className,
      date: { $gte: now }
    })
      .sort({ date: 1 })
      .lean();

    if (!event) {
      throw new AppError("Yaklaşan etkinlik bulunamadı", 404);
    }

    return event;
  }

  // ⭐ Etkinlik oluşturma
  async createEvent(body, currentUser) {
    const { title, date, type, className, description } = body;

    if (!className || !title || !date) {
      throw new AppError("Gerekli alanlar eksik (title, date, className)", 400);
    }

    // 🔥 Öğretmen sadece kendi sınıfına etkinlik ekleyebilir
    if (currentUser.role === "teacher" && currentUser.className !== className) {
      throw new AppError("Bu sınıfa etkinlik ekleme yetkiniz yok", 403);
    }

    const newEvent = await Schedule.create({
      title,
      date,
      type,
      className,
      description
    });

    // Sınıftaki öğrencilere bildirim gönder
    await this.notifyStudents(className, title);

    return {
      message: "Etkinlik eklendi",
      event: newEvent
    };
  }

  // ⭐ Tüm etkinlikler
  async getAllEvents() {
    return await Schedule.find().sort({ date: 1 });
  }

  // ⭐ Sınıftaki tüm öğrencilere bildirim gönder
  async notifyStudents(className, title) {
    // Sınıf bazlı öğrencileri Student tablosundan bul
    const students = await Student.find({ className }).populate('user', '_id');

    if (!students.length) {
      // Burada hata fırlatmak zorunda değiliz, sadece loglamak daha mantıklı
      console.log(`ℹ️ ${className} sınıfında öğrenci bulunamadı, bildirim gönderilmedi.`);
      return;
    }

    for (const student of students) {
      if (!student.user || !student.user._id) continue;

      await notificationManager.sendSchedule(
        student.user._id,
        `Yeni etkinlik: ${title}`
      );
    }
  }
}

module.exports = new ScheduleService();
