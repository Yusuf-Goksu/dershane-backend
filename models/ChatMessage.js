const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Mesajın ait olduğu chat odası
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },

    // Gönderen kullanıcı
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Alan kullanıcı
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Yazılı mesaj
    text: {
      type: String,
    },

    // Sesli mesaj (URL)
    audioUrl: {
      type: String,
    },

    // Okundu bilgisi (isteğe bağlı)
    isRead: {
      type: Boolean,
      default: false,
    },

    // Eski route'larında manual set ettiğin time alanı
    // (yoksa createdAt üzerinden de okunuyor)
    time: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
