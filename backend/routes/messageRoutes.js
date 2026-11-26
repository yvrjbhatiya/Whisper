// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { authenticate } = require("../controllers/userController");

router.get("/getMessages/:room", authenticate, messageController.getMessages);

module.exports = router;
