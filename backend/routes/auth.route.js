const authController = require('../controllers/auth.controllers');
const express = require('express');
const router = express.Router();

router.post('/login', authController.login);

// router.post('/logout', authController.logout);

module.exports = router;