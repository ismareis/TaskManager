const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', asyncHandler(UserController.create));
router.get('/:id', authMiddleware, asyncHandler(UserController.getById));
router.put('/:id', authMiddleware, asyncHandler(UserController.update));
router.delete('/:id', authMiddleware, asyncHandler(UserController.delete));

module.exports = router;