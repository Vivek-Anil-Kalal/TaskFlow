const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    const { search } = req.query;
    const query = {};

    if (search) {
        query.username = { $regex: search, $options: 'i' };
    }

    try {
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        // In a real app, you might fetch projects where the user is a member
        // const projects = await Project.find({ teamMembers: req.user._id });

        // For now returning user info. 
        // If we need projects, we can add them to the response locally or fetch them.
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Invite a new user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
    const { email, role, fullName } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user with this code as password (hashed by model)
        // Username defaults to part of email
        const username = email.split('@')[0];

        const user = await User.create({
            username,
            fullName: fullName || '',
            email,
            password: code,
            role: role || 'developer',
            invitedBy: req.user._id
        });

        // Send Email with the code
        const message = `
            <h1>Welcome to TaskFlow!</h1>
            <p>You have been invited to join TaskFlow as a <strong>${role}</strong>.</p>
            <p>Your temporary login code (password) is:</p>
            <h2>${code}</h2>
            <p>Please log in and change your password.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'TaskFlow Invitation',
                html: message,
            });
            res.status(201).json({
                message: `User created and invitation sent to ${email}`, user: {
                    _id: user._id, username: user.username, email: user.email, role: user.role
                }
            });
        } catch (emailError) {
            // If email fails, we might want to delete the user or just warn
            // For now, return success but warn about email
            res.status(201).json({
                message: `User created but email failed: ${emailError.message}. Code: ${code}`, user: {
                    _id: user._id, username: user.username, email: user.email, role: user.role
                }
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, getUserProfile, createUser };
