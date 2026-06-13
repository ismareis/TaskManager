const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/:id', authMiddleware, asyncHandler(UserController.getById));

module.exports = router;