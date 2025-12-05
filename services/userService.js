const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class UserService {

  // ⭐ Şifre değiştirme
  async changePassword(userId, data) {
    const { oldPassword, newPassword } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("Eski şifre hatalı", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return { message: "Şifre başarıyla değiştirildi" };
  }

}

module.exports = new UserService();
