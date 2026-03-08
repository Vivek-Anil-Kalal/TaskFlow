const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/authController');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
