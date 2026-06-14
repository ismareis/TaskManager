const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const GoogleAuthController = require('../controllers/GoogleAuthController');
const authMiddleware = require('../middleware/authMiddleware');
const googleConfigMiddleware = require('../middleware/googleConfigMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', asyncHandler(AuthController.login));

router.post('/logout', authMiddleware, asyncHandler(AuthController.logout));

router.post('/google/login', googleConfigMiddleware,  authMiddleware, asyncHandler(GoogleAuthController.redirect));

router.post('/google/logout', googleConfigMiddleware, authMiddleware, asyncHandler(GoogleAuthController.logout));

router.get('/google/callback', googleConfigMiddleware, asyncHandler(GoogleAuthController.callback));

module.exports = router;