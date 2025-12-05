// ----------------------------------------------------
// 🔹 1) Environment + Core Modules
// ----------------------------------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Chat service (istersen sonra aktif ederiz)
const chatService = require("./services/chatService");

// ----------------------------------------------------
// 🔹 2) Express App
// ----------------------------------------------------
const app = express();
const server = http.createServer(app);

// ----------------------------------------------------
// 🔹 3) Socket.io (Flutter uyumlu, JWT ZORUNLU DEĞİL)
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🚨 JWT ZORUNLULUĞU KAPATILDI — Flutter token göndermiyor
io.use((socket, next) => {
  console.log("⚠️ JWT doğrulama devre dışı — socket kabul edildi.");
  // İstersen sender bilgisini Flutter’dan alacağız
  socket.user = null;
  next();
});

// ----------------------------------------------------
// 🔹 4) Socket Events
// ----------------------------------------------------
io.on("connection", (socket) => {
  console.log("🟢 Socket bağlandı:", socket.id);

  // 🔸 Odaya katıl
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📌 Socket ${socket.id} odaya katıldı → ${roomId}`);
  });

  // 🔸 Mesaj gönder (Flutter uyumlu format)
  socket.on("sendMessage", async (data) => {
    try {
      /*
        Flutter şu formatta yolluyor:
        {
          roomId: "123",
          text: "Merhaba",
          sender: "userid123",
          time: "2025-02-12T14:22"
        }
      */

      console.log("💬 Mesaj alındı:", data);

      // Eğer DB'ye kaydetmek istersen:
      /*
      const savedMessage = await chatService.sendMessage(
        { _id: data.sender }, 
        data.roomId, 
        { type: "text", text: data.text }
      );
      io.to(data.roomId).emit("receiveMessage", savedMessage);
      */

      // Şimdilik direkt geri gönderiyoruz (Flutter bu formatı dinliyor)
      io.to(data.roomId).emit("receiveMessage", data);

      console.log(`📤 Mesaj gönderildi → ${data.roomId}`);

    } catch (err) {
      console.error("❌ sendMessage hatası:", err);
      socket.emit("errorMessage", {
        message: err.message || "Mesaj gönderilemedi",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket ayrıldı:", socket.id);
  });
});

// ----------------------------------------------------
// 🔹 5) Middleware’ler
// ----------------------------------------------------
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 🔹 6) Database Bağlantısı
// ----------------------------------------------------
connectDB();

// ----------------------------------------------------
// 🔹 7) Route Imports
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send("🎓 Dershane API çalışıyor (Kurumsal) ✅");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/parents", require("./routes/parentRoutes"));
app.use("/api/schedule", require("./routes/scheduleRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/uploads", express.static(__dirname + "/uploads"));

// ----------------------------------------------------
// 🔹 8) Global Error Handler
// ----------------------------------------------------
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

// ----------------------------------------------------
// 🔹 9) Server Başlatma
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Sunucu Socket.io ile birlikte ${PORT} portunda çalışıyor`);
});
