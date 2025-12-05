const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    // Konuşmaya dahil kullanıcılar (2 kişi)
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],

    // Son mesajı listede göstermek için
    lastMessage: {
      type: String,
      default: '',
    },

    // Son mesaj zamanı (liste sıralaması için)
    lastMessageTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
