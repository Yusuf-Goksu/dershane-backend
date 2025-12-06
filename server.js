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
  res.send(`
  <!DOCTYPE html>
  <html lang="tr">
  <head>
      <meta charset="UTF-8">
      <title>❤️ Hoş Geldin</title>

      <style>
          body {
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: radial-gradient(circle at top, #0a0010, #000000 75%);
              font-family: "Poppins", sans-serif;
              overflow: hidden;
              color: #fff;
              position: relative;
          }

          /* Arka loş parlama efekti */
          .glow {
              position: absolute;
              width: 600px;
              height: 600px;
              background: radial-gradient(circle, rgba(255,100,180,0.4), transparent 70%);
              filter: blur(90px);
              animation: pulse 7s infinite ease-in-out;
              z-index: 1;
          }

          @keyframes pulse {
              0% { transform: scale(1); opacity: 0.4; }
              50% { transform: scale(1.3); opacity: 0.7; }
              100% { transform: scale(1); opacity: 0.4; }
          }

          /* Kalp animasyonları */
          .heart {
              position: absolute;
              color: rgba(255, 80, 140, 0.8);
              font-size: 22px;
              animation: floatUp 6s linear infinite;
              z-index: 2;
              user-select: none;
          }

          @keyframes floatUp {
              0% { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(-120vh); opacity: 0; }
          }

          /* Merkez kart */
          .container {
              z-index: 3;
              text-align: center;
              padding: 40px 50px;
              background: rgba(255, 255, 255, 0.06);
              border-radius: 20px;
              backdrop-filter: blur(14px);
              box-shadow: 0 0 25px rgba(255, 150, 200, 0.18);
              animation: fadeIn 1.5s ease-out;
              cursor: pointer; /* tıklanabilir olduğunu hissettirmek için */
          }

          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(25px); }
              to { opacity: 1; transform: translateY(0); }
          }

          h1 {
              font-size: 2.7rem;
              background: linear-gradient(90deg, #ff7adf, #ffcdf5);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 12px;
          }

          p {
              font-size: 1.2rem;
              color: #ddd;
          }

          .tap {
              margin-top: 20px;
              font-size: 0.9rem;
              opacity: 0.7;
              animation: blink 1.4s infinite;
          }

          @keyframes blink {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
          }
      </style>
  </head>

  <body>

      <div class="glow"></div>

      <!-- Merkez kart -->
      <div class="container" id="tapArea">
          <h1>✨ Hoş Geldin Rümeysam</h1>
          <p>Bu sistem çalışıyor… ama sen gelince hoş bi melodi fısldıyor.</p>
          <div class="tap">Devam etmek için tıkla 🎵</div>
      </div>

      <!-- Müzik -->
      <audio id="music" preload="auto">
          <source src="/muzik/romantik.mp3" type="audio/mpeg">
      </audio>

      <script>
          /* 🎵 TIKLANINCA MÜZİK BAŞLASIN */
          function startMusic() {
              const music = document.getElementById("music");
              music.volume = 0.35;
              music.play().catch(() => {});
              document.removeEventListener("click", startMusic);
              document.removeEventListener("touchstart", startMusic);
          }

          document.addEventListener("click", startMusic);
          document.addEventListener("touchstart", startMusic);

          /* ❤️ SÜZÜLEN KALPLER */
          function createHeart() {
              const heart = document.createElement("div");
              heart.classList.add("heart");
              heart.innerHTML = "❤️";

              heart.style.left = Math.random() * 100 + "vw";
              heart.style.bottom = "-20px";
              heart.style.fontSize = (18 + Math.random() * 18) + "px";
              heart.style.animationDuration = (4 + Math.random() * 5) + "s";

              document.body.appendChild(heart);

              setTimeout(() => heart.remove(), 7000);
          }

          setInterval(createHeart, 400);
      </script>

  </body>
  </html>
  `);
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
