module.exports = (err, req, res, next) => {
  console.error("❌ ERROR:", err);

  const status = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Sunucu hatası. Lütfen tekrar deneyin.";

  res.status(status).json({
    success: false,
    message,
    statusCode: status
  });
};
