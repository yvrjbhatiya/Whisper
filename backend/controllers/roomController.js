const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");
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
  const rooms = await Room.find({ $or: [{ isPrivate: false }, { members: req.user._id }] }).populate("members", "username displayName avatar").sort({ roomName: 1 });
  res.json(await Promise.all(rooms.map(async (room) => {
    const peer = room.isDirect && room.members.find((member) => String(member._id) !== String(req.user._id));
    const unreadCount = room.isDirect ? await Message.countDocuments({
      room: room.roomName,
      userId: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
      deleted: false,
    }) : 0;
    return { name: room.roomName, displayName: peer ? (peer.displayName || peer.username) : room.roomName, peerId: peer?._id, peerUsername: peer?.username, peerAvatar: peer?.avatar || "", isPrivate: room.isPrivate, isDirect: room.isDirect, unreadCount, inviteId: room.isPrivate ? room.inviteId : undefined, isOwner: String(room.owner) === String(req.user._id) };
  })));
};

exports.createDirectRoom = async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const peer = await User.findOne({ username });
  if (!peer) return res.status(404).json({ error: "No user has that username." });
  if (String(peer._id) === String(req.user._id)) return res.status(400).json({ error: "Choose another person to start a direct message." });
  const ids = [String(req.user._id), String(peer._id)].sort();
  const directKey = ids.join(":");
  let room = await Room.findOne({ directKey });
  if (!room) room = await Room.create({ roomName: `dm-${crypto.randomBytes(12).toString("hex")}`, isPrivate: true, isDirect: true, directKey, members: [req.user._id, peer._id] });
  res.json({ success: true, room: { name: room.roomName, displayName: peer.username, isPrivate: true, isDirect: true } });
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

exports.deleteRoom = async (req, res) => {
  const room = await Room.findOne({ roomName: req.params.roomName });
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!room.isPrivate || room.isDirect || String(room.owner) !== String(req.user._id)) return res.status(403).json({ error: "Only the private-room creator can delete it." });
  await Message.deleteMany({ room: room.roomName });
  await room.deleteOne();
  res.json({ success: true });
};
