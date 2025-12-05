const News = require('../models/News');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const notificationManager = require('./notification/notificationManager');

class NewsService {

  // ⭐ Haber oluştur
  async createNews(data, currentUser) {
    const { title, content, imageUrl } = data;

    if (!title || !content) {
      throw new AppError("Başlık ve içerik gereklidir", 400);
    }

    const news = await News.create({
      title,
      content,
      imageUrl: imageUrl || null,
      createdBy: currentUser._id
    });

    // 📢 Öğrencilere duyuru bildirimi gönder
    const students = await User.find({ role: "student" }).select('_id');

    if (students.length > 0) {
      // Bildirimleri paralel göndermek için (çok daha hızlı)
      await Promise.all(
        students.map(student =>
          notificationManager.sendAnnouncement(
            student._id,
            `Yeni duyuru: ${title}`
          )
        )
      );
    }

    return {
      message: "Haber başarıyla eklendi",
      news
    };
  }

  // ⭐ Tüm haberleri listele
  async getAllNews() {
    return await News.find().sort({ createdAt: -1 });
  }
}

module.exports = new NewsService();
