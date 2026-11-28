const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.get("/me", userController.authenticate, userController.me);
router.patch("/me", userController.authenticate, userController.updateProfile);
router.get("/profiles", userController.authenticate, userController.getProfiles);
router.get("/profile/:id", userController.authenticate, userController.getProfile);
module.exports = router;
