const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

class ChatService {

  // ================
  // ROL KONTROLÜ
  // ================
  canChat(roleA, roleB) {
    if (roleA === 'teacher' && (roleB === 'student' || roleB === 'parent')) return true;
    if (roleB === 'teacher' && (roleA === 'student' || roleA === 'parent')) return true;

    if ((roleA === 'student' && roleB === 'teacher') ||
        (roleA === 'teacher' && roleB === 'student'))
      return true;

    if ((roleA === 'parent' && roleB === 'teacher') ||
        (roleA === 'teacher' && roleB === 'parent'))
      return true;

    return false;
  }

  // ===========================
  // 1) ODA OLUŞTUR / GETİR
  // ===========================
  async createRoom(currentUser, targetUserId) {
    if (!targetUserId) {
      const err = new Error("Hedef kullanıcı gereklidir");
      err.statusCode = 400;
      throw err;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      const err = new Error("Hedef kullanıcı bulunamadı");
      err.statusCode = 404;
      throw err;
    }

    if (!this.canChat(currentUser.role, targetUser.role)) {
      const err = new Error("Bu kullanıcı ile mesajlaşma yetkiniz yok");
      err.statusCode = 403;
      throw err;
    }

    let room = await ChatRoom.findOne({
      participants: { $all: [currentUser._id, targetUser._id] }
    });

    if (!room) {
      room = await ChatRoom.create({
        participants: [currentUser._id, targetUser._id]
      });
    }

    await room.populate("participants", "name role");

    return {
      roomId: room._id,
      participants: room.participants,
      lastMessage: room.lastMessage,
      lastMessageTime: room.lastMessageTime || room.updatedAt,
    };
  }

  // ===========================
  // 2) MESAJ GÖNDER
  // ===========================
  async sendMessage(senderUser, { roomId, text, audioUrl }) {

    console.log("📌 Backend senderUser:", senderUser);
    
    if (!senderUser || !senderUser._id) {
      const err = new Error("Gönderen kullanıcı bulunamadı (senderUserId eksik).");
      err.statusCode = 400;
      throw err;
    }

    if (!roomId) {
      const err = new Error("roomId gereklidir");
      err.statusCode = 400;
      throw err;
    }

    if (!text && !audioUrl) {
      const err = new Error("text veya audioUrl gerekli");
      err.statusCode = 400;
      throw err;
    }

    const room = await ChatRoom.findById(roomId).populate('participants', 'name role');

    if (!room) {
      const err = new Error("Oda bulunamadı");
      err.statusCode = 404;
      throw err;
    }

    const isParticipant = room.participants.some(
      p => p._id.toString() === senderUser._id.toString()
    );

    if (!isParticipant) {
      const err = new Error("Bu odaya mesaj gönderemezsiniz");
      err.statusCode = 403;
      throw err;
    }

    const receiver = room.participants.find(
      p => p._id.toString() !== senderUser._id.toString()
    );

    const now = new Date();

    const message = await Message.create({
      roomId,
      sender: senderUser._id,
      receiver: receiver._id,
      text,
      audioUrl,
      time: now,
    });

    room.lastMessage = text || "🎤 Sesli mesaj";
    room.lastMessageTime = now;
    await room.save();

    return {
      id: message._id.toString(),
      roomId,
      sender: senderUser._id.toString(),
      receiver: receiver._id.toString(),
      text: text || null,
      audioUrl: audioUrl || null,
      time: now.toISOString(),
    };
  }

  // ===========================
  // 3) MESAJLARI GETİR
  // ===========================
  async getMessages(userId, roomId) {
    const room = await ChatRoom.findById(roomId);

    if (!room) {
      const err = new Error("Oda bulunamadı");
      err.statusCode = 404;
      throw err;
    }

    const isParticipant = room.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      const err = new Error("Bu odanın mesajlarını göremezsiniz");
      err.statusCode = 403;
      throw err;
    }

    const msgs = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .lean();

    return msgs.map(m => ({
      id: m._id,
      roomId: m.roomId,
      sender: m.sender._id,
      receiver: m.receiver._id,
      text: m.text || null,
      audioUrl: m.audioUrl || null,
      time: m.time || m.createdAt,
      createdAt: m.createdAt,
    }));
  }

  // ===========================
  // 4) ODALARI GETİR
  // ===========================
  async getMyRooms(userId) {
    const rooms = await ChatRoom.find({ participants: userId })
      .populate("participants", "name role")
      .lean();

    return rooms.map(room => {
      const other = room.participants.find(p => p._id.toString() !== userId.toString());

      return {
        roomId: room._id,
        otherUser: {
          id: other?._id,
          name: other?.name,
          role: other?.role,
        },
        lastMessage: room.lastMessage || '',
        lastMessageTime: room.lastMessageTime || room.updatedAt,
      };
    });
  }

  // ===========================
  // 5) KULLANICI LİSTESİ
  // ===========================
  async getAvailableUsers(currentUser) {
    let users = [];

    if (currentUser.role === "student") {
      users = await User.find({ role: "teacher" }).select("name role");
    } else if (currentUser.role === "teacher") {
      users = await User.find({ role: { $in: ["student", "parent"] } }).select("name role");
    } else if (currentUser.role === "parent") {
      users = await User.find({ role: "teacher" }).select("name role");
    } else if (currentUser.role === "admin") {
      users = await User.find().select("name role");
    }

    return users.map(u => ({
      id: u._id,
      name: u.name,
      role: u.role,
    }));
  }

  // ===========================
  // 6) SESLİ MESAJ
  // ===========================
  async sendAudioMessage(userId, roomId, audioUrl) {
    const room = await ChatRoom.findById(roomId);

    if (!room) {
      const err = new Error("Oda bulunamadı");
      err.statusCode = 404;
      throw err;
    }

    const receiver = room.participants.find(
      p => p.toString() !== userId.toString()
    );

    const message = await Message.create({
      roomId,
      sender: userId,
      receiver,
      audioUrl,
      text: null,
    });

    room.lastMessage = "🎤 Sesli mesaj";
    room.lastMessageTime = message.createdAt;
    await room.save();

    return {
      id: message._id,
      audioUrl,
      time: message.createdAt,
      sender: userId,
    };
  }
}

module.exports = new ChatService();
