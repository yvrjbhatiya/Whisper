const Message = require("../models/Message");
const Room = require("../models/Room");

// Logic to get messages by room
exports.getMessages = async (req, res, next) => {
  const room = req.params.room;
  try {
    const roomInfo = await Room.findOne({ roomName: room });
    if (!roomInfo || (roomInfo.isPrivate && !roomInfo.members.some((id) => String(id) === String(req.user._id)))) return res.status(403).json({ error: "Room unavailable." });
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
};
