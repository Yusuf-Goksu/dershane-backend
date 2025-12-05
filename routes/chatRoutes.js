const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: './uploads/audio/',
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// ===============
// ENDPOINTLER (DEĞİŞMEDİ)
// ===============

// 1) Chat odası oluştur / bul
router.post('/create-room', authenticateToken, chatController.createRoom);

// 2) Mesaj gönder
router.post('/send-message', authenticateToken, chatController.sendMessage);

// 3) Mesajları getir
router.get('/messages/:roomId', authenticateToken, chatController.getMessages);

// 4) Kullanıcının tüm odaları
router.get('/my-rooms', authenticateToken, chatController.getMyRooms);

// 5) Mesajlaşılabilir kullanıcı listesi
router.get('/available-users', authenticateToken, chatController.getAvailableUsers);

// 6) Sesli mesaj
router.post('/send-audio', authenticateToken, upload.single('audio'), chatController.sendAudioMessage);

module.exports = router;
