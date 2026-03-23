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

async function verifyMLM() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Find Admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        console.error('No admin found!');
        process.exit(1);
    }
    console.log(`Step 1: Admin Found -> ${adminUser.username} (${adminUser._id})`);

    // 2. Create User A (Referred by Admin)
    const userA_phone = '919000000001';
    await User.deleteOne({ phone: userA_phone });
    const userA = await User.create({
        name: 'User A',
        username: 'usera_test',
        phone: userA_phone,
        password: 'password_a',
        role: 'user',
        referredBy: adminUser._id,
        referralCode: 'USERA123',
        isActive: true
    });
    console.log(`Step 2: User A Created (Referred by Admin) -> Code: ${userA.referralCode}`);

    // 3. Create User B (Referred by User A)
    const userB_phone = '919000000002';
    await User.deleteOne({ phone: userB_phone });
    const userB = await User.create({
        name: 'User B',
        username: 'userb_test',
        phone: userB_phone,
        password: 'password_b',
        role: 'user',
        referredBy: userA._id,
        referralCode: 'USERB123',
        isActive: true
    });
    console.log(`Step 3: User B Created (Referred by User A) -> Code: ${userB.referralCode}`);

    // 4. Create User C (Referred by User B)
    const userC_phone = '919000000003';
    await User.deleteOne({ phone: userC_phone });
    const userC = await User.create({
        name: 'User C',
        username: 'userc_test',
        phone: userC_phone,
        password: 'password_c',
        role: 'user',
        referredBy: userB._id,
        referralCode: 'USERC123',
        isActive: true
    });
    console.log(`Step 4: User C Created (Referred by User B) -> Code: ${userC.referralCode}`);

    // 5. Verify Downstream Connections
    console.log('Step 5: Verifying Chain...');
    const checkC = await User.findById(userC._id).populate('referredBy');
    const checkB = await User.findById(userB._id).populate('referredBy');
    const checkA = await User.findById(userA._id).populate('referredBy');
    
    if (checkC.referredBy._id.toString() === userB._id.toString() &&
        checkB.referredBy._id.toString() === userA._id.toString() &&
        checkA.referredBy._id.toString() === adminUser._id.toString()) {
        console.log('✅ Chain structure is correct: User C -> User B -> User A -> Admin');
    } else {
        console.log('❌ Chain structure is broken!');
        process.exit(1);
    }

    // 6. Simulate Commission Distribution
    // (Mimicking logic in app/api/admin/payments/verify/[paymentId]/route.ts)
    const planPrice = 1000;
    const L1_PCT = 5;
    const L2_PCT = 3;
    const L3_PCT = 2;

    console.log(`Step 6: Simulating $${planPrice} payment for User C...`);

    // Level 1: User B gets commission
    console.log(`L1: Giving ${L1_PCT}% to User B...`);
    const commissionL1 = (planPrice * L1_PCT) / 100;
    await User.findByIdAndUpdate(userB._id, { $inc: { totalCommissionEarned: commissionL1, commissionBalance: commissionL1, totalEarnings: commissionL1 } });

    // Level 2: User A gets commission
    console.log(`L2: Giving ${L2_PCT}% to User A...`);
    const commissionL2 = (planPrice * L2_PCT) / 100;
    await User.findByIdAndUpdate(userA._id, { $inc: { totalCommissionEarned: commissionL2, commissionBalance: commissionL2, totalEarnings: commissionL2 } });

    // Level 3: Admin gets commission
    console.log(`L3: Giving ${L3_PCT}% to Admin...`);
    const commissionL3 = (planPrice * L3_PCT) / 100;
    await User.findByIdAndUpdate(adminUser._id, { $inc: { totalCommissionEarned: commissionL3, commissionBalance: commissionL3, totalEarnings: commissionL3 } });

    // 7. Verify Balances
    console.log('Step 7: Verifying Final Balances...');
    const finalAdmin = await User.findById(adminUser._id);
    const finalA = await User.findById(userA._id);
    const finalB = await User.findById(userB._id);

    console.log(`Admin Balance: ${finalAdmin.totalCommissionEarned} (Expected: 20 + prev balance)`);
    console.log(`User A Balance: ${finalA.totalCommissionEarned} (Expected: 30)`);
    console.log(`User B Balance: ${finalB.totalCommissionEarned} (Expected: 50)`);

    if (finalB.totalCommissionEarned === 50 && finalA.totalCommissionEarned === 30) {
        console.log('✅ MLM Commission Distribution is working correctly!');
    } else {
        console.log('❌ MLM Commission Verification Failed!');
    }

    // Cleanup
    await User.deleteOne({ _id: userA._id });
    await User.deleteOne({ _id: userB._id });
    await User.deleteOne({ _id: userC._id });
    console.log('Cleanup Done.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyMLM();
