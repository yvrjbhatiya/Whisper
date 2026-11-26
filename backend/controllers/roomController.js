const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const roomName = req.body.roomName?.trim();
    const isPrivate = Boolean(req.body.isPrivate);
    if (!roomName || roomName.length > 30) return res.status(400).json({ error: "Enter a room name up to 30 characters." });
    if (await Room.exists({ roomName })) return res.status(409).json({ error: "That room name is already in use." });
    await Room.create({ roomName, isPrivate, owner: isPrivate ? req.user._id : null });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to create room." }); }
};

exports.listRooms = async (req, res) => {
  const rooms = await Room.find({ $or: [{ isPrivate: false }, { owner: req.user._id }] }).sort({ roomName: 1 });
  res.json(rooms.map((room) => ({ name: room.roomName, isPrivate: room.isPrivate })));
};
