const userRequestController = require("../controllers/userRequests.controller");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");

router.post("/findAll", userRequestController.findAll);
router.post("/", authenticateToken, userRequestController.create);
router.put("/:id", userRequestController.update);

module.exports = router;
