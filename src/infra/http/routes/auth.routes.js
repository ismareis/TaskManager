const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const GoogleAuthController = require('../controllers/GoogleAuthController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', asyncHandler(AuthController.login));

router.post('/logout', authMiddleware, asyncHandler(AuthController.logout));

router.post('/google/login', authMiddleware, asyncHandler(GoogleAuthController.redirect));

router.post('/google/logout', authMiddleware, asyncHandler(GoogleAuthController.logout));

router.get('/google/callback', asyncHandler(GoogleAuthController.callback));

module.exports = router;