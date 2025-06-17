const projectController = require("../controllers/projects.controller");
const express = require("express");
const router = express.Router();

router.post("/findAll", projectController.findAll);
router.post("/", projectController.create);
router.put("/:id", projectController.update);
router.put("/:id", projectController.delete);
router.delete("/:id", projectController.deleteHard);

// A FAIRE : AJOUT DES PHOTOS ET MODIFICATION DES PHOTOS
router.post("/upload/:id", projectController.uploadImage);
router.put("/updateImages/:id", projectController.updateImages);

module.exports = router;
