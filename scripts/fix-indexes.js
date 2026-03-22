const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const fixIndexes = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('users');

        // List indexes for debugging
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        try {
            // Drop the email index
            // The name is usually 'email_1', but we'll try to find it to be sure or just catch the error
            const emailIndex = indexes.find(idx => idx.key.email === 1);
            if (emailIndex) {
                console.log(`Dropping index: ${emailIndex.name}`);
                await collection.dropIndex(emailIndex.name);
                console.log('Email index dropped successfully.');
            } else {
                console.log('Email index not found, trying standard name "email_1" anyway...');
                await collection.dropIndex('email_1');
            }
        } catch (err) {
            console.log('Error dropping email index (might not exist):', err.message);
        }

        console.log('Index fix operation completed.');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixIndexes();
