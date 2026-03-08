const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, managerCode } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let role = 'developer';
        if (managerCode && managerCode === process.env.MANAGER_CODE) {
            role = 'manager';
        }

        const user = await User.create({
            username,
            email,
            password,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: user,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email orpassword' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Forgot Password - sends code to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account with that email found' });
        }

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash and store on user
        user.resetPasswordToken = crypto.createHash('sha256').update(code).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save({ validateBeforeSave: false });

        const html = `
            <h2>TaskFlow - Password Reset</h2>
            <p>You requested a password reset. Use the code below. It expires in 15 minutes.</p>
            <h1 style="letter-spacing:8px; font-size:36px;">${code}</h1>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await emailService.sendEmail({ email: user.email, subject: 'TaskFlow Password Reset Code', html });
            res.json({ message: 'Reset code sent to email' });
        } catch (emailErr) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ message: 'Email could not be sent' + emailErr.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: hashedCode,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        res.json({ message: 'Code verified', valid: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: hashedCode,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, verifyResetCode, resetPassword };
