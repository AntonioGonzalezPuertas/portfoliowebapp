const profileController = require("../controllers/profiles.controller");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");

// router.get('/', profileController.findAll); // old version

router.post("/findAll", profileController.findAll);
router.post("/", profileController.create);
router.put("/:id", authenticateToken, profileController.update);
router.put("/:id", authenticateToken, profileController.delete);
router.delete("/:id", profileController.deleteHard);

module.exports = router;
