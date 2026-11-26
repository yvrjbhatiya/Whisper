
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true, trim: true },
  isPrivate: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  inviteId: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDirect: { type: Boolean, default: false },
  directKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
