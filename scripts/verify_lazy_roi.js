const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: '.env' });

const API_URL = 'http://localhost:3000/api';
// Force model registration
import '../models/User';
import '../models/Plan';
import '../models/Transaction';
import { distributeUserRoi } from '../lib/roi_engine';

async function verifyLazyRoi() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Find a user with an active plan
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

        const initialRoiBalance = user.roiBalance || 0;
        console.log(`Initial ROI Balance: ${initialRoiBalance}`);

        // 3. Generate token
        const token = jwt.sign(
            { id: user._id.toString(), username: user.username, role: user.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

// 4. Run the ROI Engine directly
        console.log("Running ROI Engine directly...");
        const result = await distributeUserRoi(user._id.toString());

        if (result.success) {
            console.log(`ROI Distributed: $${result.amount} for ${result.cycles} cycles.`);
            
            // Re-fetch from DB to check actual update
            const updatedUser = await mongoose.connection.collection('users').findOne({ _id: user._id });
            const finalRoiBalance = updatedUser.roiBalance || 0;
            console.log(`Initial ROI Balance: ${initialRoiBalance}`);
            console.log(`Final ROI Balance: ${finalRoiBalance}`);
            
            if (finalRoiBalance > initialRoiBalance) {
                console.log("SUCCESS: Lazy ROI distributed correctly! ✅");
            } else {
                console.log("FAILURE: ROI balance did not increase in database. ❌");
            }
        } else {
            console.log(`ROI Engine returned failure: ${result.message}`);
        }

    } catch (error) {
        console.error("Verification Error:", error.message);
        if (error.response) console.log(error.response.data);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

verifyLazyRoi();
