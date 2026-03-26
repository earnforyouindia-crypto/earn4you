import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function checkUser() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const user = await mongoose.connection.collection('users').findOne({ username: 'ravi8784' });
    console.log(JSON.stringify(user, null, 2));
    await mongoose.connection.close();
    process.exit();
}

checkUser();
