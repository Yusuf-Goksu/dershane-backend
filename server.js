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
      <title>✨ Hoş Geldin</title>

      <style>
          :root {
              --glow-color: rgba(255, 180, 220, 0.7);
          }

          body {
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: radial-gradient(circle at top, #2b0030, #0a0010 70%);
              font-family: "Poppins", sans-serif;
              overflow: hidden;
              color: #fff;
          }

          /* Parlayan noktalar (soft glow particles) */
          .particle {
              position: absolute;
              background: var(--glow-color);
              border-radius: 50%;
              filter: blur(6px);
              opacity: 0.6;
              animation: float 10s infinite;
          }

          @keyframes float {
              0% { transform: translateY(0) scale(1); opacity: 0.6; }
              50% { opacity: 1; }
              100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
          }

          .container {
              text-align: center;
              padding: 40px 50px;
              background: rgba(255, 255, 255, 0.06);
              backdrop-filter: blur(14px);
              border-radius: 20px;
              box-shadow: 0 0 25px rgba(255, 170, 220, 0.25);
              animation: fadeIn 1.4s ease-out;
          }

          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(25px); }
              to { opacity: 1; transform: translateY(0); }
          }

          h1 {
              font-size: 2.8rem;
              margin-bottom: 10px;
              background: linear-gradient(90deg, #ff8ad6, #ffcff7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
          }

          p {
              font-size: 1.3rem;
              color: #eee;
          }

          .signature {
              margin-top: 20px;
              font-size: 1rem;
              opacity: 0.75;
          }
      </style>
  </head>

  <body>

      <!-- Parlayan noktalar otomatik üretilecek -->
      <div id="particles"></div>

      <div class="container">
          <h1>✨ Hoş Geldin Güzel Ruh</h1>
          <p>Bu sistem çalışıyor… ama sen geldiğinde biraz daha güzelleşiyor.</p>
          <div class="signature">— Yusuf’un özel alanı</div>
      </div>

      <script>
          // Parlak noktaları rastgele oluşturma
          const particlesContainer = document.getElementById("particles");

          function createParticle() {
              const p = document.createElement("div");
              p.classList.add("particle");

              const size = Math.random() * 10 + 4;
              p.style.width = size + "px";
              p.style.height = size + "px";
              p.style.left = Math.random() * 100 + "vw";
              p.style.top = (60 + Math.random() * 40) + "vh"; 
              p.style.animationDuration = 6 + Math.random() * 6 + "s";

              particlesContainer.appendChild(p);

              setTimeout(() => p.remove(), 12000);
          }

          setInterval(createParticle, 350);
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
