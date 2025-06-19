const projectController = require("../controllers/projects.controller");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");

router.post("/findAll", projectController.findAll);
router.post("/", authenticateToken, projectController.create);
router.put("/:id", authenticateToken, projectController.update);
router.put("/:id", authenticateToken, projectController.delete);
router.delete("/:id", projectController.deleteHard);

// A FAIRE : AJOUT DES PHOTOS ET MODIFICATION DES PHOTOS
router.put("/upload/:id", projectController.uploadImage);
//router.put("/updateImages/:id", projectController.updateImages);

module.exports = router;
