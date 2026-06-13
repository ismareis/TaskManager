const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', asyncHandler(UserController.create));

module.exports = router;