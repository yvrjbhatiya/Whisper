const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate } = require("../controllers/userController");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", authenticate, asyncHandler(roomController.listRooms));
router.post("/createRoom", authenticate, asyncHandler(roomController.createRoom));
router.post("/join-private", authenticate, asyncHandler(roomController.joinPrivateRoom));
router.post("/direct", authenticate, asyncHandler(roomController.createDirectRoom));
router.delete("/:roomName", authenticate, asyncHandler(roomController.deleteRoom));
module.exports = router;
