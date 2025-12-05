const emailService = require('./emailService');
const pushService = require('./pushService');
const User = require('../../models/User');
const notifyConfig = require('../../config/notificationConfig');

class NotificationManager {

  async sendAll(userId, {
    title,
    body,
    emailText = null,
    emailHtml = null,
    data = {},
    mode // artık isteğe bağlı; eğer gelmezse config'ten okunur
  }, configKey) {

    const user = await User.findById(userId);
    if (!user) return;

    // 🔥 Eğer parametre olarak mode verilmezse → config'ten oku
    const finalMode = mode || notifyConfig[configKey] || "push";

    // --- Bildirim modları ---

    if (finalMode === "none") {
      return; // hiçbir bildirim gönderme
    }

    if (finalMode === "push") {
      await pushService.sendPush(userId, { title, body, data });
      return;
    }

    if (finalMode === "email") {
      await emailService.sendMail(user.email, title, emailText, emailHtml);
      return;
    }

    if (finalMode === "both") {
      if (emailText || emailHtml) {
        await emailService.sendMail(user.email, title, emailText, emailHtml);
      }
      await pushService.sendPush(userId, { title, body, data });
      return;
    }
  }


  // ⭐ Devamsızlık
  async sendAttendanceWarning(parentId, studentName, dateString) {
    return this.sendAll(
      parentId,
      {
        title: "Devamsızlık Bilgilendirmesi",
        body: `${studentName} ${dateString} tarihinde derse katılmadı.`,
        emailText: `Öğrenciniz ${studentName} ${dateString} tarihinde derse katılmamıştır.`,
        emailHtml: `
          <h3>Devamsızlık Bilgilendirmesi</h3>
          <p><b>Öğrenci:</b> ${studentName}</p>
          <p><b>Tarih:</b> ${dateString}</p>
          <p>Bu tarihte derse katılmamıştır.</p>
        `,
        data: {
          type: 'attendance',
          studentName,
          date: dateString,
        }
      },
      "attendance" // 🔥 notificationConfig içindeki key
    );
  }

  // ⭐ Deneme Sonucu
  async sendExamResult(studentId, examTitle, net) {
    return this.sendAll(
      studentId,
      {
        title: "Yeni Deneme Sonucu",
        body: `${examTitle} sonuçlarınız açıklandı! Net: ${net}`,
        emailText: `Sınav: ${examTitle}\nToplam Net: ${net}`,
        emailHtml: `
          <h3>Yeni Deneme Sonucunuz Yayınlandı</h3>
          <p><b>Sınav:</b> ${examTitle}</p>
          <p><b>Toplam Net:</b> ${net}</p>
        `,
        data: {
          type: "exam-result",
          examTitle,
          net: String(net)
        }
      },
      "examResult" // 🔥 config anahtarı
    );
  }

  // ⭐ Ders Programı / Etkinlik
  async sendSchedule(userId, text) {
    return this.sendAll(
      userId,
      {
        title: "Yeni Etkinlik",
        body: text,
        emailText: text,
        data: { type: "schedule" }
      },
      "schedule"
    );
  }

  async sendAnnouncement(userId, text) {
  return this.sendAll(
    userId,
    {
      title: "Yeni Duyuru",
      body: text,
      emailText: text,
      data: { type: "announcement" }
    },
    "announcement"
  );
}

  
}

module.exports = new NotificationManager();
