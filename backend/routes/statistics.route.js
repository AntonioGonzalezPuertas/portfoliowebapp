const statisticsController = require('../controllers/statistics.controller');
const express = require('express');
const router = express.Router();

router.get('/', statisticsController.getStats);

module.exports = router;