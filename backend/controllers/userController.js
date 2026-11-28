const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const AVATARS = require("../config/avatars");

const sessions = new Map();
// Full profile – only ever sent to the account owner (includes email).
const publicUser = (user) => ({ id: user._id, username: user.username, email: user.email, displayName: user.displayName || user.username, bio: user.bio || "", avatar: user.avatar || "" });
// What *other* people may see: avatar, name, username, bio. Never email.
const publicProfile = (user) => ({ id: user._id, username: user.username, displayName: user.displayName || user.username, bio: user.bio || "", avatar: user.avatar || "" });
const createSession = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, String(user._id));
  return token;
};
exports.getSessionUser = async (token) => {
  const userId = token && sessions.get(token);
  return userId ? User.findById(userId) : null;
};

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
    const userId = token && sessions.get(token);
    const user = userId && await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Please sign in again." });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: "Please sign in again." }); }
};

exports.signup = async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!/^[a-z0-9_]{3,24}$/.test(username || "")) return res.status(400).json({ error: "Use 3–24 letters, numbers, or underscores for your username." });
    if (!/^\S+@\S+\.\S+$/.test(email || "")) return res.status(400).json({ error: "Enter a valid email address." });
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
    if (await User.exists({ username })) return res.status(409).json({ error: "That username is already taken." });
    if (await User.exists({ email })) return res.status(409).json({ error: "An account already uses that email." });
    const user = await User.create({ username, email, password: await bcrypt.hash(password, 12), displayName: username });
    res.status(201).json({ user: publicUser(user) });
  } catch { res.status(500).json({ error: "Could not create account." }); }
};

exports.login = async (req, res) => {
  try {
    const identity = req.body.identity?.trim().toLowerCase();
    const { password } = req.body;
    const user = await User.findOne({ $or: [{ username: identity }, { email: identity }] });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ error: "Incorrect username/email or password." });
    res.json({ token: createSession(user), user: publicUser(user) });
  } catch { res.status(500).json({ error: "Could not sign in." }); }
};

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.updateProfile = async (req, res) => {
  try {
    const { username, displayName, bio, avatar } = req.body;

    if (typeof username === "string" && username.trim().toLowerCase() !== req.user.username) {
      const nextUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,24}$/.test(nextUsername)) return res.status(400).json({ error: "Use 3–24 letters, numbers, or underscores." });
      if (await User.exists({ username: nextUsername })) return res.status(409).json({ error: "That username is already taken." });
      req.user.username = nextUsername;
    }
    if (typeof displayName === "string") {
      const name = displayName.trim();
      if (!name || name.length > 40) return res.status(400).json({ error: "Name must be 1–40 characters." });
      req.user.displayName = name;
    }
    if (typeof bio === "string") {
      if (bio.trim().length > 180) return res.status(400).json({ error: "Bio can be at most 180 characters." });
      req.user.bio = bio.trim();
    }
    if (typeof avatar === "string") {
      if (avatar && !AVATARS.includes(avatar)) return res.status(400).json({ error: "Choose one of the available avatars." });
      req.user.avatar = avatar;
    }

    await req.user.save();
    // Let everyone who is online refresh this person's avatar/name straight away.
    req.app.get("io")?.emit("profileUpdated", publicProfile(req.user));
    res.json({ user: publicUser(req.user) });
  } catch { res.status(500).json({ error: "Could not update profile." }); }
};

// Public view of one user (by id): avatar, name, username, bio.
exports.getProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "User not found." });
    const user = await User.findById(req.params.id).select("username displayName bio avatar");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ profile: publicProfile(user) });
  } catch { res.status(500).json({ error: "Could not load profile." }); }
};

// Batch version used to put avatars next to chat messages: ?ids=a,b,c
exports.getProfiles = async (req, res) => {
  try {
    const ids = String(req.query.ids || "").split(",").filter((id) => mongoose.isValidObjectId(id)).slice(0, 100);
    const users = ids.length ? await User.find({ _id: { $in: ids } }).select("username displayName bio avatar") : [];
    res.json({ profiles: users.map(publicProfile) });
  } catch { res.status(500).json({ error: "Could not load profiles." }); }
};
exports.forgotPassword = (req, res) => res.json({ success: true, message: "If that email is registered, a password-reset email has been sent." });
