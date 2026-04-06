import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { distributeUserRoi } from '../lib/roi_engine';
import '../models/User';
import '../models/Plan';
import '../models/Transaction';

dotenv.config({ path: '.env' });

async function debugMultiLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to DB");

        const username = "testuser_roi";
        const user = await mongoose.connection.collection('users').findOne({ username });

        if (!user) {
            console.log("Test user not found. Please run create_roi_test_user.ts first.");
            process.exit();
        }

        console.log(`Debug User: ${user.username}`);
        
        // 1. Reset state to "payment due" (25 hours ago)
        const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
        await mongoose.connection.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastRoiDistribution: yesterday, roiBalance: 0, earnedFromPlan: 0 } }
        );
        console.log("Reset user state: lastRoiDistribution = 25h ago, Balance = 0");

        // 2. First Distribute
        console.log("\nAttempt 1 (Expected: Success)");
        const res1 = await distributeUserRoi(user._id.toString());
        console.log(`Result 1: ${JSON.stringify(res1)}`);

        // 3. Second Distribute (Expected: Failure - Already distributed within 24h)
        console.log("\nAttempt 2 (Expected: Failure - Already distributed within 24h)");
        const res2 = await distributeUserRoi(user._id.toString());
        console.log(`Result 2: ${JSON.stringify(res2)}`);

        // 4. Third Distribute (Expected: Failure)
        console.log("\nAttempt 3 (Expected: Failure)");
        const res3 = await distributeUserRoi(user._id.toString());
        console.log(`Result 3: ${JSON.stringify(res3)}`);

    } catch (error) {
        console.error("Debug Error:", (error as Error).message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

debugMultiLogin();
