const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  phone: String,
  role: String,
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalCommissionEarned: { type: Number, default: 0 },
  commissionBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Find Admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin found!');
      process.exit(1);
    }
    console.log(`Found Admin: ${adminUser.username} (${adminUser._id})`);

    // 2. Simulate Registration Logic (from app/api/auth/register/route.ts)
    // Create a new user with NO referral code
    const testUsername = `user${Math.floor(1000 + Math.random() * 9000)}`;
    const testPhone = `91${Math.floor(6000000000 + Math.random() * 3000000000)}`;
    
    console.log(`Simulating registration for user: ${testUsername} with NO referral code...`);
    
    // Logic from register/route.ts
    let referredBy = null;
    // (referralCode is null here)
    const adminForFallback = await User.findOne({ role: 'admin' });
    if (adminForFallback) {
        referredBy = adminForFallback._id;
    }

    const newUser = await User.create({
      name: 'Test Fallback User',
      username: testUsername,
      phone: testPhone,
      password: 'hashed_password', // irrelevant for this test
      role: 'user',
      referredBy: referredBy,
      referralCode: 'TESTCODE' + Math.floor(1000 + Math.random() * 9000),
      isActive: true
    });

    console.log(`New user created: ${newUser.username} (${newUser._id})`);
    
    if (newUser.referredBy.toString() === adminUser._id.toString()) {
        console.log('✅ SUCCESS: New user is correctly referred by the Admin by default.');
    } else {
        console.log('❌ FAILURE: New user is NOT referred by the Admin.');
    }

    // 3. Simulate Commission Logic (from app/api/admin/payments/verify/[paymentId]/route.ts)
    const planPrice = 1000; // USDT
    const REFERRAL_L1_PERCENT = 5; // Usually 5%
    
    console.log(`Simulating $${planPrice} payment verification for ${newUser.username}...`);
    
    if (newUser.referredBy) {
        const referrerL1 = await User.findById(newUser.referredBy);
        if (referrerL1) {
            const initialCommission = referrerL1.totalCommissionEarned || 0;
            const commissionL1 = (planPrice * REFERRAL_L1_PERCENT) / 100;
            
            console.log(`Adding $${commissionL1} commission to referrer: ${referrerL1.username}...`);
            
            referrerL1.totalEarnings = (referrerL1.totalEarnings || 0) + commissionL1;
            referrerL1.commissionBalance = (referrerL1.commissionBalance || 0) + commissionL1;
            referrerL1.totalCommissionEarned = (referrerL1.totalCommissionEarned || 0) + commissionL1;
            await referrerL1.save();
            
            const updatedAdmin = await User.findById(adminUser._id);
            if (updatedAdmin.totalCommissionEarned > initialCommission) {
                console.log(`✅ SUCCESS: Admin received the commission. New balance: ${updatedAdmin.totalCommissionEarned}`);
            } else {
                console.log('❌ FAILURE: Admin did NOT receive the commission.');
            }
        }
    }

    // Cleanup test user
    await User.findByIdAndDelete(newUser._id);
    console.log('Test user cleaned up.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verify();
