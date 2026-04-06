import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { distributeUserRoi } from '../lib/roi_engine';
import '../models/User';
import '../models/Plan';
import '../models/Transaction';

dotenv.config({ path: '.env' });

async function verifyLazyRoi() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not defined");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Find a user with an active plan
        // Use the connection directly to avoid model issues if they aren't fully initialized
        const user = await mongoose.connection.collection('users').findOne({ 
            isActive: true, 
            planActive: true,
            plan: { $ne: null }
        });

        if (!user) {
            console.log("No active user with a plan found to test.");
            process.exit();
        }

        console.log(`Found User: ${user.username}`);

        // 2. Manipulate lastRoiDistribution to be 25 hours ago
        const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
        await mongoose.connection.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastRoiDistribution: yesterday } }
        );
        console.log(`Updated lastRoiDistribution to: ${yesterday.toISOString()}`);

        const initialBalance = user.commissionBalance || 0;
        console.log(`Initial Available Balance: ${initialBalance}`);

        // 3. Run the ROI Engine directly
        console.log("Running ROI Engine directly...");
        const result = await distributeUserRoi(user._id.toString());

        if (result.success) {
            console.log(`ROI Distributed: $${result.amount} for ${result.cycles} cycles.`);
            
            // Re-fetch from DB to check actual update
            const updatedUser = await mongoose.connection.collection('users').findOne({ _id: user._id });
            if (!updatedUser) {
                console.log("FAILURE: Could not re-fetch user from database.");
                return;
            }
            const finalBalance = (updatedUser as any).commissionBalance || 0;
            console.log(`Initial Balance: ${initialBalance}`);
            console.log(`Final Balance: ${finalBalance}`);
            
            if (finalBalance > initialBalance) {
                console.log("SUCCESS: Lazy ROI distributed to Commission Balance! ✅");
            } else {
                console.log("FAILURE: Commission balance did not increase in database. ❌");
            }
        } else {
            console.log(`ROI Engine returned failure: ${result.message}`);
        }

    } catch (error) {
        console.error("Verification Error:", (error as Error).message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

verifyLazyRoi();
