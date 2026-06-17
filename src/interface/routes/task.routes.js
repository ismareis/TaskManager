const express = require('express');
const router = express.Router();

const TaskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', authMiddleware, asyncHandler(TaskController.create));
router.get('/:id', authMiddleware, asyncHandler(TaskController.getById));
router.delete('/:id', authMiddleware, asyncHandler(TaskController.delete));

router.get('/', authMiddleware, asyncHandler(TaskController.list));
router.put('/:id', authMiddleware, asyncHandler(TaskController.update));

module.exports = router;