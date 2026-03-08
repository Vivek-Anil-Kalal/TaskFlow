const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedSuperAdmin = async () => {
    try {
        const adminEmail = process.env.SUPER_ADMIN_EMAIL;
        const adminUsername = process.env.SUPER_ADMIN_USERNAME;
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword || !adminUsername) {
            console.log('Super Admin credentials not found in .env, skipping seeding.');
            return;
        }

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Super Admin already exists.');
            return;
        }

        // Passwords are hashed in the pre-save hook of the User model
        const superAdmin = new User({
            username: adminUsername,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            jobTitle: 'Super Admin',
        });

        await superAdmin.save();
        console.log('Super Admin created successfully.');
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
    }
};

module.exports = seedSuperAdmin;
