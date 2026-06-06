const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', AuthController.login);

router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;