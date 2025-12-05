const bcrypt = require('bcrypt');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const AppError = require('../utils/AppError');
const tokenHelper = require('../utils/tokenHelper');

class AuthService {

  // ⭐ REGISTER
  async register(data, createdByAdmin = false) {
    const { name, email, password, role } = data;

    // Email kontrol
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Bu email zaten kullanılıyor", 400);
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // ----------------------------------------------------
    // ⭐ ROL GÜVENLİĞİ
    // Normal kullanıcı → student olarak kaydedilmeli
    // Admin panel → teacher / parent / admin oluşturabilir
    // ----------------------------------------------------
    let finalRole = "student";

    if (createdByAdmin) {
      // Sadece admin özel kullanıcı tipi oluşturabilir
      const allowedRoles = ["student", "teacher", "parent", "admin"];
      if (!allowedRoles.includes(role)) {
        throw new AppError("Geçersiz rol", 400);
      }
      finalRole = role;
    }

    // Yeni user oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    // Öğrenci ise Student kaydı oluştur
    if (user.role === "student") {
      await Student.create({
        user: user._id,
        exams: [],
        attendance: []
      });
    }

    // Veli ise Parent kaydı oluştur
    if (user.role === "parent") {
      await Parent.create({
        user: user._id,
        students: []
      });
    }

    // Token oluştur
    const token = tokenHelper.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  // ⭐ LOGIN
  async login(data) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Şifre hatalı", 400);
    }

    // Öğrenci ise className'i bul
    let className = null;
    if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      className = student?.className || null;
    }

    // Token oluştur
    const token = tokenHelper.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        className
      }
    };
  }
}

module.exports = new AuthService();
