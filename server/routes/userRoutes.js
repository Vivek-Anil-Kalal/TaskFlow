const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile, createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
