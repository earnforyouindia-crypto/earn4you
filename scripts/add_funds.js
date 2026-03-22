const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function addFunds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const username = 'gg8275';
        const amount = 50;

        const result = await mongoose.connection.collection('users').findOneAndUpdate(
            { username: username },
            {
                $inc: {
                    commissionBalance: amount,
                    totalEarnings: amount,
                    availableBalance: amount
                }
            },
            { returnDocument: 'after' }
        );

        if (result) {
            console.log(`Successfully added ${amount} USDT to @${username}.`);
            console.log(`New Commission Balance: ${result.commissionBalance} USDT`);
        } else {
            console.log(`User @${username} not found!`);
        }
    } catch (error) {
        console.error("Error adding funds:", error);
    } finally {
        process.exit();
    }
}

addFunds();
