
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true }, // Define text as a string type
    timestamp: { type: Date, default: Date.now }, // Add default value for timestamp
    room: String,
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  });

  
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;


// Create a message schema


