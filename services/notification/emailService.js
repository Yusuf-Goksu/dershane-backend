// services/notification/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendMail(to, subject, text, html = null) {
    const msg = {
      to,
      from: process.env.MAIL_SENDER || 'noreply@dershanemplus.com.tr',
      subject,
      text,
      html
    };

    try {
      await sgMail.send(msg);
      console.log(`📧 Mail gönderildi → ${to}`);
    } catch (err) {
      console.error("❌ Mail gönderilemedi:", err.message);
      // Kurumsal mimaride hatayı propagate ederiz:
      const error = new Error("Mail gönderilemedi");
      error.statusCode = 500;
      throw error;
    }
  }
}

module.exports = new EmailService();
