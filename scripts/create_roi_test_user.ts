import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to DB");

        const phone = "0000000000";
        const password = "password123";
        const username = "testuser_roi";

        // Check if exists
        const existing = await mongoose.connection.collection('users').findOne({ phone });
        if (existing) {
            console.log("Test user already exists. Phone: 0000000000, Password: password123");
            process.exit();
        }

        // Get Plan 10
        const plan = await mongoose.connection.collection('plans').findOne({ price: 10 });
        if (!plan) {
            console.log("Plan 10 not found. Please run seed script first.");
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name: "Test ROI User",
            username,
            phone,
            password: hashedPassword,
            role: "user",
            plan: plan._id,
            planActive: true,
            planStartDate: new Date(),
            lastRoiDistribution: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago to trigger ROI
            isActive: true,
            earnedFromPlan: 0,
            roiBalance: 0,
            totalEarnings: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await mongoose.connection.collection('users').insertOne(newUser);
        console.log("SUCCESS: Created Test User!");
        console.log("Username: testuser_roi");
        console.log("Phone: 0000000000");
        console.log("Password: password123");
        console.log("Plan: Plan 10 ($1/day)");
        console.log("Initial State: ROI due (last payout was 25h ago)");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

createTestUser();
