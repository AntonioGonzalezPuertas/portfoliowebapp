const projectController = require("../controllers/projects.controller");
const express = require("express");
const router = express.Router();

router.post("/findAll", projectController.findAll);
router.post("/:token", projectController.create);
router.put("/:id/:token", projectController.update);
router.put("/:id/:token", projectController.delete);
router.delete("/:id", projectController.deleteHard);

module.exports = router;
