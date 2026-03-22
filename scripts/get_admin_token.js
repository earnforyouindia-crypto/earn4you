const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });

async function getAdminToken() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    // Find an admin user
    const admin = await mongoose.connection.collection('users').findOne({ role: 'admin' });
    if (!admin) {
        console.log("No admin found");
        process.exit();
    }

    console.log("Admin found:", admin.username);

    // Generate token
    const token = jwt.sign(
        { id: admin._id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
    );

    console.log("TOKEN:", token);
    process.exit();
}

getAdminToken();
