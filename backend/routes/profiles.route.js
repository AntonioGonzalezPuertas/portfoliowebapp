const profileController = require('../controllers/profiles.controller');
const express = require('express');
const router = express.Router();

// router.get('/', profileController.findAll); // old version

router.post('/findAll', profileController.findAll)
router.post('/', profileController.create);
router.put('/:id', profileController.update);
router.put('/:id', profileController.delete);
router.delete('/:id', profileController.deleteHard);

module.exports = router;