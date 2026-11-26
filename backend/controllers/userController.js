const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const sessions = new Map();
const publicUser = (user) => ({ id: user._id, username: user.username, email: user.email, displayName: user.displayName || user.username, bio: user.bio || "" });
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
  const { username } = req.body;
  if (typeof username === "string" && username.trim().toLowerCase() !== req.user.username) {
    const nextUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(nextUsername)) return res.status(400).json({ error: "Use 3–24 letters, numbers, or underscores." });
    if (await User.exists({ username: nextUsername })) return res.status(409).json({ error: "That username is already taken." });
    req.user.username = nextUsername;
    req.user.displayName = nextUsername;
  }
  await req.user.save();
  res.json({ user: publicUser(req.user) });
};
exports.forgotPassword = (req, res) => res.json({ success: true, message: "If that email is registered, a password-reset email has been sent." });
