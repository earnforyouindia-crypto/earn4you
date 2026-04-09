const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function migrateBalances() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // We use the collection directly to avoid schema validation issues during migration
        const usersCollection = mongoose.connection.collection('users');

        console.log("Starting migration for all users...");
        
        /**
         * Migration logic:
         * 1. availableBalance = current commissionBalance + current roiBalance
         * 2. commissionBalance = totalCommissionEarned (restore lifetime stat)
         */
        const result = await usersCollection.updateMany(
            {}, 
            [
                { 
                    $set: { 
                        availableBalance: { 
                            $add: [
                                { $ifNull: ["$commissionBalance", 0] }, 
                                { $ifNull: ["$roiBalance", 0] },
                                { $ifNull: ["$availableBalance", 0] } // Include any existing availableBalance
                            ] 
                        },
                        commissionBalance: { $ifNull: ["$totalCommissionEarned", 0] }
                    } 
                }
            ]
        );

        console.log(`✅ Migration completed!`);
        console.log(`- Matched documents: ${result.matchedCount}`);
        console.log(`- Modified documents: ${result.modifiedCount}`);

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

migrateBalances();
