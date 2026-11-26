const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate } = require("../controllers/userController");

router.get("/", authenticate, roomController.listRooms);
router.post("/createRoom", authenticate, roomController.createRoom);
router.post("/join-private", authenticate, roomController.joinPrivateRoom);
module.exports = router;
