// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const Message = require("./models/Message");
const Room = require("./models/Room");
const { getSessionUser } = require("./controllers/userController");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
app.set("io", io); // lets controllers broadcast (e.g. profile updates)
const onlineUsers = new Map();
const userRoom = (id) => `user:${String(id)}`;
const broadcastPresence = (userId, online) => io.emit("userPresence", { userId: String(userId), online });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

io.use(async (socket, next) => {
  const user = await getSessionUser(socket.handshake.auth?.token);
  if (!user) return next(new Error("Authentication required"));
  socket.data.user = user;
  next();
});

// Socket.io events
io.on("connection", (socket) => {
  const userId = String(socket.data.user._id);
  socket.join(userRoom(userId));
  const firstConnection = !onlineUsers.has(userId);
  onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
  if (firstConnection) broadcastPresence(userId, true);
  socket.emit("presenceSnapshot", [...onlineUsers.keys()]);
  socket.on("sendMessage", async (data) => {
    const room = await Room.findOne({ roomName: data.message.room });
    if (!room || (room.isPrivate && !room.members.some((id) => String(id) === String(socket.data.user._id)))) return;
    const recipients = room.isDirect ? room.members.filter((id) => String(id) !== userId) : [];
    const newMessage = new Message({
      user: socket.data.user.username,
      userId: socket.data.user._id,
      text: data.message.text,
      timestamp: new Date(),
      room: data.message.room,
      // A message is only "delivered" after the recipient's client confirms it.
      deliveredTo: [],
      readBy: [socket.data.user._id],
    });

    await newMessage.save();

    // Room delivery is instant for the open conversation; user rooms ensure DMs
    // arrive even when the recipient is looking elsewhere.
    io.to(data.message.room).emit("message", newMessage);
    recipients.forEach((id) => {
      io.to(userRoom(id)).emit("message", newMessage);
      io.to(userRoom(id)).emit("directNotification", {
        id: String(newMessage._id), room: newMessage.room, title: newMessage.user,
        text: newMessage.text, timestamp: newMessage.timestamp,
      });
    });
  });

  socket.on("messageReceived", async ({ messageId }) => {
    const message = await Message.findById(messageId);
    if (!message || String(message.userId) === userId) return;
    const room = await Room.findOne({ roomName: message.room });
    if (!room?.isDirect || !room.members.some((id) => String(id) === userId)) return;

    await Message.updateOne({ _id: message._id }, { $addToSet: { deliveredTo: socket.data.user._id } });
    io.to(userRoom(message.userId)).emit("messageDelivered", {
      messageId: String(message._id), recipientId: userId, room: message.room,
    });
  });

  socket.on("markRead", async ({ room: roomName }) => {
    const room = await Room.findOne({ roomName });
    if (!room || !room.members.some((id) => String(id) === userId)) return;
    const unread = await Message.find({ room: roomName, userId: { $ne: socket.data.user._id }, readBy: { $ne: socket.data.user._id } }).select("_id userId");
    if (!unread.length) return;
    await Message.updateMany({ _id: { $in: unread.map((message) => message._id) } }, { $addToSet: { readBy: socket.data.user._id, deliveredTo: socket.data.user._id } });
    unread.forEach((message) => io.to(userRoom(message.userId)).emit("messageRead", { messageId: String(message._id), readerId: userId, room: roomName }));
    socket.emit("roomRead", { room: roomName });
  });

  socket.on("getPresence", (ids, done) => {
    const status = (ids || []).reduce((result, id) => ({ ...result, [String(id)]: onlineUsers.has(String(id)) }), {});
    done?.(status);
  });

  socket.on("editMessage", async ({ messageId, text }) => {
    const message = await Message.findById(messageId);
    if (!message || message.deleted || (message.userId && String(message.userId) !== String(socket.data.user._id)) || (!message.userId && message.user !== socket.data.user.username)) return;
    const nextText = text?.trim();
    if (!nextText || nextText.length > 2000) return;
    message.text = nextText;
    message.edited = true;
    await message.save();
    io.to(message.room).emit("messageUpdated", message);
  });

  socket.on("deleteMessage", async ({ messageId }) => {
    const message = await Message.findById(messageId);
    if (!message || message.deleted || (message.userId && String(message.userId) !== String(socket.data.user._id)) || (!message.userId && message.user !== socket.data.user.username)) return;
    message.text = "Message deleted";
    message.deleted = true;
    await message.save();
    io.to(message.room).emit("messageDeleted", message);
  });

  socket.on("joinRoom", async (room) => {
    const requested = await Room.findOne({ roomName: room });
    if (!requested || (requested.isPrivate && !requested.members.some((id) => String(id) === String(socket.data.user._id)))) return;
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  socket.on("disconnect", () => {
    const count = (onlineUsers.get(userId) || 1) - 1;
    if (count > 0) onlineUsers.set(userId, count);
    else {
      onlineUsers.delete(userId);
      broadcastPresence(userId, false);
    }
  });


  socket.on("error", (error) => {
    console.error("Error:", error);
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
