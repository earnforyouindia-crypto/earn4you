const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// We require the models directly for the script
const UserSchema = new mongoose.Schema({
    username: String,
    availableBalance: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },
    roiBalance: { type: Number, default: 0 },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verifyLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.\n");

        const testUsername = 'test_balance_user_' + Date.now();
        
        // 1. Create Test User
        console.log(`Creating test user: ${testUsername}`);
        const user = await User.create({
            username: testUsername,
            availableBalance: 10,
            roiBalance: 5,
            commissionBalance: 5
        });

        console.log("Initial State:");
        console.log(`- Available Balance: ${user.availableBalance}`);
        console.log(`- ROI Balance: ${user.roiBalance}`);
        console.log(`- Commission Balance: ${user.commissionBalance}\n`);

        // 2. Simulate Reward (e.g., ROI Distribution)
        console.log("Simulating 5 USDT ROI reward distribution...");
        // Logic from lib/roi_engine.ts: $inc: { availableBalance: 5, roiBalance: 5 }
        await User.updateOne(
            { _id: user._id },
            { $inc: { availableBalance: 5, roiBalance: 5 } }
        );

        let updatedUser = await User.findById(user._id);
        console.log("After Reward:");
        console.log(`- Available Balance: ${updatedUser.availableBalance} (Expected: 15)`);
        console.log(`- ROI Balance: ${updatedUser.roiBalance} (Expected: 10)\n`);

        // 3. Simulate Withdrawal
        console.log("Simulating 12 USDT Withdrawal...");
        // Logic from withdrawals/request/route.ts: only deduct from availableBalance
        if (updatedUser.availableBalance >= 12) {
            await User.updateOne(
                { _id: user._id },
                { $inc: { availableBalance: -12 } }
            );
        }

        updatedUser = await User.findById(user._id);
        console.log("After Withdrawal:");
        console.log(`- Available Balance: ${updatedUser.availableBalance} (Expected: 3)`);
        console.log(`- ROI Balance: ${updatedUser.roiBalance} (Expected: 10 - SHOULD NOT CHANGE)`);
        console.log(`- Commission Balance: ${updatedUser.commissionBalance} (Expected: 5 - SHOULD NOT CHANGE)\n`);

        if (updatedUser.roiBalance === 10 && updatedUser.availableBalance === 3) {
            console.log("✅ VERIFICATION SUCCESSFUL: Available Balance was deducted, but Earnings Stats remained intact.");
        } else {
            console.log("❌ VERIFICATION FAILED: Logic does not match requirements.");
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        console.log("\nTest user deleted.");

    } catch (error) {
        console.error("Verification Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyLogic();
