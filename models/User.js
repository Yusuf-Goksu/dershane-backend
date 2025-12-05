const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 🔹 Kullanıcının tam adı
  name: { 
    type: String, 
    required: [true, 'İsim alanı zorunludur'] 
  },

  // 🔹 E-posta adresi (benzersiz ve doğru formatta)
  email: { 
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Geçerli bir e-posta adresi giriniz'] // Regex ile format kontrolü
  },

  // 🔹 Şifre (hashlenmiş şekilde kaydedilir, minimum uzunluk 8)
  password: { 
    type: String, 
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [8, 'Şifre en az 8 karakter olmalıdır'] 
  },

  // 🔹 Kullanıcı rolü
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'parent', 'admin'], 
    default: 'student' 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
