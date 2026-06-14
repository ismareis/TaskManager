const express = require('express');
const router = express.Router();

const TaskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', authMiddleware, asyncHandler(TaskController.create));

module.exports = router;