const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  displayName: { type: String, trim: true, maxlength: 40 },
  bio: { type: String, trim: true, maxlength: 180, default: "" },
  avatar: { type: String, trim: true, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
