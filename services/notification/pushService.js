const NotificationToken = require('../../models/NotificationToken');
const admin = require('../../config/firebaseAdmin');

class PushService {

  async sendPush(userId, { title, body, data = {} }) {
    const doc = await NotificationToken.findOne({ user: userId });

    if (!doc || !doc.tokens || doc.tokens.length === 0) {
      console.log("📵 Kullanıcının FCM tokenı yok:", userId);
      return;
    }

    // Tüm cihazlara gönder
    for (const device of doc.tokens) {
      try {
        await admin.messaging().send({
          token: device.token,
          notification: { title, body },
          data: Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          )
        });

        console.log("📨 Push gönderildi:", device.platform, device.token);

      } catch (err) {
        console.error("❌ Push gönderilemedi:", device.token, err.message);

        // Token ölmüş ise kaldır
        if (err.errorInfo?.code === "messaging/registration-token-not-registered") {
          await NotificationToken.updateOne(
            { user: userId },
            { $pull: { tokens: { token: device.token } } }
          );
          console.log("🗑️ Geçersiz token temizlendi:", device.token);
        }
      }
    }
  }
}

module.exports = new PushService();
