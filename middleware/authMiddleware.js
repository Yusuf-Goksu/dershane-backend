const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Token bulunamadı");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token içine role ekledik → role check için DB sorgusu gerekmiyor
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      const error = new Error("Kullanıcı bulunamadı");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();

  } catch (err) {
    err.statusCode = err.statusCode || 403;
    next(err);
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error("Yetki doğrulanamadı");
        error.statusCode = 401;
        throw error;
      }

      if (!roles.includes(req.user.role)) {
        const error = new Error("Bu işlem için yetkiniz yok");
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
