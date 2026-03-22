const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function updateThreshold() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const result = await mongoose.connection.collection('users').updateMany(
            {},
            { $set: { withdrawalThreshold: 10 } }
        );

        console.log(`Successfully updated ${result.modifiedCount} users to have a 10 USDT withdrawal threshold.`);
    } catch (error) {
        console.error("Error updating users:", error);
    } finally {
        process.exit();
    }
}

updateThreshold();
