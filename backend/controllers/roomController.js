const Room = require("../models/Room");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const newInviteId = () => crypto.randomBytes(4).toString("hex").toUpperCase();

exports.createRoom = async (req, res) => {
  try {
    const roomName = req.body.roomName?.trim();
    const isPrivate = Boolean(req.body.isPrivate);
    if (!roomName || roomName.length > 30) return res.status(400).json({ error: "Enter a room name up to 30 characters." });
    if (await Room.exists({ roomName })) return res.status(409).json({ error: "That room name is already in use." });
    if (isPrivate && (!req.body.password || req.body.password.length < 6)) return res.status(400).json({ error: "Private-room password must be at least 6 characters." });
    let inviteId;
    if (isPrivate) do { inviteId = newInviteId(); } while (await Room.exists({ inviteId }));
    await Room.create({ roomName, isPrivate, owner: isPrivate ? req.user._id : null, inviteId, password: isPrivate ? await bcrypt.hash(req.body.password, 12) : undefined, members: isPrivate ? [req.user._id] : [] });
    res.json({ success: true, inviteId });
  } catch { res.status(500).json({ error: "Failed to create room." }); }
};

exports.listRooms = async (req, res) => {
  const rooms = await Room.find({ $or: [{ isPrivate: false }, { members: req.user._id }] }).sort({ roomName: 1 });
  res.json(rooms.map((room) => ({ name: room.roomName, isPrivate: room.isPrivate, inviteId: room.isPrivate ? room.inviteId : undefined })));
};

exports.joinPrivateRoom = async (req, res) => {
  const inviteId = req.body.inviteId?.trim().toUpperCase();
  const { password } = req.body;
  const room = await Room.findOne({ inviteId }).select("+password");
  if (!room || !room.isPrivate || !(await bcrypt.compare(password || "", room.password || ""))) return res.status(401).json({ error: "That room ID or password is incorrect." });
  if (!room.members.some((id) => String(id) === String(req.user._id))) {
    room.members.push(req.user._id);
    await room.save();
  }
  res.json({ success: true, room: { name: room.roomName, isPrivate: true, inviteId: room.inviteId } });
};
