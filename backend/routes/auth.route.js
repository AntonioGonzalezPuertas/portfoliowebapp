const authController = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/login", authController.login);

router.put("/changePassword/:id/:token", authController.changePassword);

router.post("/logout/:token", authController.logout);

module.exports = router;
