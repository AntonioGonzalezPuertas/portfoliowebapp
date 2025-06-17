const authController = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");

router.post("/login", authController.login);

router.put(
  "/changePassword/:id",
  authenticateToken,
  authController.changePassword
);

router.post("/logout", authenticateToken, authController.logout);

router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
