const express = require("express");
const { authenticate } = require("../controllers/userController");
const { upload, uploadAttachment, uploadError } = require("../controllers/uploadController");

const router = express.Router();

router.post("/attachment", authenticate, upload, uploadError, uploadAttachment);

module.exports = router;
