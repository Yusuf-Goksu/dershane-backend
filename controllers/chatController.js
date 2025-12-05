const asyncHandler = require('../middleware/asyncHandler');
const chatService = require('../services/chatService');

exports.createRoom = asyncHandler(async (req, res) => {
  const result = await chatService.createRoom(req.user, req.body.targetUserId);
  res.json(result);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const result = await chatService.sendMessage(req.user, req.body);
  res.status(201).json(result);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const result = await chatService.getMessages(req.user._id, req.params.roomId);
  res.json(result);
});

exports.getMyRooms = asyncHandler(async (req, res) => {
  const result = await chatService.getMyRooms(req.user._id);
  res.json(result);
});

exports.getAvailableUsers = asyncHandler(async (req, res) => {
  const result = await chatService.getAvailableUsers(req.user);
  res.json(result);
});

exports.sendAudioMessage = asyncHandler(async (req, res) => {
  const result = await chatService.sendAudioMessage(
    req.user._id,
    req.body.roomId,
    req.file ? `/uploads/audio/${req.file.filename}` : null
  );

  res.json(result);
});
