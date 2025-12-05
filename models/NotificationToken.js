const mongoose = require('mongoose');

const notificationTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  tokens: [
    {
      token: { type: String, required: true },
      platform: { type: String, default: "android" },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("NotificationToken", notificationTokenSchema);
