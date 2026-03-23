const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  role: String,
  planActive: Boolean,
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Check Admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
        console.log('--- Admin User ---');
        console.log(`ID: ${admin._id}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Role: ${admin.role}`);
        console.log(`Plan Active: ${admin.planActive}`);
        console.log(`Referral Code: ${admin.referralCode}`);
    } else {
        console.log('❌ No Admin User Found!');
    }

    // 2. Check Last Registered User
    const lastUser = await User.findOne().sort({ createdAt: -1 }).populate('referredBy');
    if (lastUser) {
        console.log('\n--- Last Registered User ---');
        console.log(`ID: ${lastUser._id}`);
        console.log(`Username: ${lastUser.username}`);
        if (lastUser.referredBy) {
            console.log(`Referred By ID: ${lastUser.referredBy._id}`);
            console.log(`Referred By Username: ${lastUser.referredBy.username}`);
            
            if (admin && lastUser.referredBy._id.toString() === admin._id.toString()) {
                console.log('✅ User IS referred by Admin.');
            } else {
                console.log('⚠️ User is referred by someone else.');
            }
        } else {
            console.log('❌ Referred By is NULL (Fallback failed)');
        }
    } else {
        console.log('No users found.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debug();
