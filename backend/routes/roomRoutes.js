const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate } = require("../controllers/userController");

router.get("/", authenticate, roomController.listRooms);
router.post("/createRoom", authenticate, roomController.createRoom);
module.exports = router;
