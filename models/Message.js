const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },    //Mesajın ait olduğu chat odası
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },        //Gönderen kullanıcı
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },      //Alan kullanıcı

  // Yazılı mesaj
  text: { type: String },

  // Sesli mesaj (URL)
  audioUrl: { type: String },

  // Okundu bilgisi (isteğe bağlı)
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
