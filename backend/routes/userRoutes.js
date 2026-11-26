const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.get("/me", userController.authenticate, userController.me);
router.patch("/me", userController.authenticate, userController.updateProfile);
module.exports = router;
