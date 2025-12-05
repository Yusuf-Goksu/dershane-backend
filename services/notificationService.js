const NotificationToken = require('../models/NotificationToken');
const AppError = require('../utils/AppError');

class NotificationService {

  // ⭐ TOKEN KAYDETME (ÇOKLU CİHAZ DESTEKLİ)
  async registerToken(userId, data) {
    const { token, platform } = data;

    if (!token) {
      throw new AppError("FCM token zorunludur", 400);
    }

    // 1 — Aynı token diğer kullanıcılarda kayıtlıysa kaldır
    await NotificationToken.updateMany(
      { "tokens.token": token },
      { $pull: { tokens: { token } } }
    );

    // 2 — Aynı kullanıcıda eski kaydı varsa kaldır
    await NotificationToken.findOneAndUpdate(
      { user: userId },
      { $pull: { tokens: { token } } }
    );

    // 3 — Token’ı ekle
    const updatedDoc = await NotificationToken.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          tokens: {
            token,
            platform: platform || "android",
            updatedAt: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    return {
      message: "Token kaydedildi",
      data: updatedDoc
    };
  }

  // ⭐ TEK TOKEN SİLME (Logout)
  async removeToken(userId, token) {
    if (!token) {
      throw new AppError("Silinecek token belirtilmedi", 400);
    }

    const result = await NotificationToken.findOneAndUpdate(
      { user: userId },
      { $pull: { tokens: { token } } },
      { new: true }
    );

    return {
      message: "Cihaz tokeni silindi",
      data: result
    };
  }

  // ⭐ TÜM TOKENLERİ SİLME (Hesap kapatma, tüm cihazlardan çıkış)
  async removeAllTokens(userId) {
    const result = await NotificationToken.findOneAndUpdate(
      { user: userId },
      { tokens: [] },
      { new: true }
    );

    return {
      message: "Kullanıcının tüm cihaz tokenleri silindi",
      data: result
    };
  }
}

module.exports = new NotificationService();
