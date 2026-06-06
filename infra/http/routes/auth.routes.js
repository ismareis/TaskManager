const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', asyncHandler(AuthController.login));

router.post('/logout', authMiddleware, asyncHandler(AuthController.logout));

module.exports = router;