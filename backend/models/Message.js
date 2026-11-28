const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // A message can contain text, attachments, or both.
    text: { type: String, default: "" },
    attachments: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      name: { type: String, required: true },
      mimeType: { type: String, default: "application/octet-stream" },
      resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
      bytes: { type: Number, default: 0 },
      format: String,
      width: Number,
      height: Number,
      duration: Number,
    }],
    timestamp: { type: Date, default: Date.now }, // Add default value for timestamp
    room: String,
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    // These arrays make delivery state durable, so it survives refreshes/reconnects.
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  });

  
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;


// Create a message schema
