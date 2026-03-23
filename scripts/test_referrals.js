const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const { Schema } = mongoose;

// Models
const UserSchema = new Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const PaymentSchema = new Schema({}, { strict: false });
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
const PlanSchema = new Schema({}, { strict: false });
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

const API_URL = 'http://127.0.0.1:3000/api';
let adminToken = '';

const color = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m"
};

async function log(msg, type = 'info') {
    const c = type === 'success' ? color.green : type === 'error' ? color.red : type === 'warn' ? color.yellow : color.blue;
    console.log(`${c}[REF-TEST] ${msg}${color.reset}`);
}

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
}

async function cleanData() {
    await connectDB();
    await User.deleteMany({ phone: { $in: ['9000000000', '9000000001', '9000000002', '9000000003'] } });
    await Payment.deleteMany({ 'verificationNotes': 'TEST_REF_PAYMENT' });
    log('Cleaned up previous referral test data.', 'warn');
}

async function runTest() {
    try {
        await cleanData();

        // 1. Create Admin (L3 Receiver)
        log('1. Creating Admin (L3 Receiver)...');
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Ref Admin', phone: '9000000000', password: 'password123', walletAddress: '0xRefAdmin'
        });
        const adminId = adminRes.data.user.id;
        adminToken = adminRes.data.token;
        await User.findByIdAndUpdate(adminId, { role: 'admin' });
        // Re-login for admin role token
        const adminLogin = await axios.post(`${API_URL}/auth/login`, { phone: '9000000000', password: 'password123' });
        adminToken = adminLogin.data.token;
        log('Admin Created & Promoted ✅', 'success');


        // 2. Create User A (L2 Receiver, Referred by Admin)
        log('2. Creating User A (L2 Receiver)...');
        const adminUser = await User.findById(adminId);
        const resA = await axios.post(`${API_URL}/auth/register`, {
            name: 'User A', phone: '9000000001', password: 'password123', referralCode: adminUser.referralCode
        });
        const userAId = resA.data.user.id;
        // User A needs active plan to earn commission
        await User.findByIdAndUpdate(userAId, { planActive: true, isActive: true });
        log('User A Created & Activated ✅', 'success');


        // 3. Create User B (L1 Receiver, Referred by User A)
        log('3. Creating User B (L1 Receiver)...');
        const userA = await User.findById(userAId);
        const resB = await axios.post(`${API_URL}/auth/register`, {
            name: 'User B', phone: '9000000002', password: 'password123', referralCode: userA.referralCode
        });
        const userBId = resB.data.user.id;
        // User B needs active plan to earn commission
        await User.findByIdAndUpdate(userBId, { planActive: true, isActive: true });
        log('User B Created & Activated ✅', 'success');


        // 4. Create User C (Investor, Referred by User B)
        log('4. Creating User C (Investor)...');
        const userB = await User.findById(userBId);
        const resC = await axios.post(`${API_URL}/auth/register`, {
            name: 'User C', phone: '9000000003', password: 'password123', referralCode: userB.referralCode
        });
        const userCId = resC.data.user.id;
        log('User C Created ✅', 'success');


        // 5. Create Payment for User C
        log('5. Creating Payment for User C...');
        // Create a dummy plan or just use amount
        const plan = await Plan.create({ name: 'Test Plan', price: 1000, dailyProfit: 10, monthlyProfit: 300, referralCommission: 0 });
        
        const payment = await Payment.create({
            userId: userCId,
            amount: 1000,
            transactionHash: 'TEST_TX_HASH_' + Date.now(),
            status: 'pending',
            method: 'crypto',
            planId: plan._id,
            verificationNotes: 'TEST_REF_PAYMENT',
            screenshotUrl: 'http://example.com/screenshot.jpg',
            walletAddress: '0xTestWalletAddress'
        });
        log(`Payment Created: ${payment._id} (1000 USDT) ✅`, 'success');


        // 6. Verify Payment as Admin
        log('6. Verifying Payment as Admin...');
        await axios.post(`${API_URL}/admin/payments/verify/${payment._id}`, {
            verificationNotes: 'Approved via Test Script'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        log('Payment Verified ✅', 'success');


        // 7. Verify Commissions
        log('7. Verifying Commissions...');
        
        // Expected:
        // L1 (User B): 5% of 1000 = 50
        // L2 (User A): 3% of 1000 = 30
        // L3 (Admin): 2% of 1000 = 20

        const finalB = await User.findById(userBId);
        const finalA = await User.findById(userAId);
        const finalAdmin = await User.findById(adminId);

        log(`User B (L1) Expected: 50, Actual: ${finalB.totalCommissionEarned}`);
        log(`User A (L2) Expected: 30, Actual: ${finalA.totalCommissionEarned}`);
        log(`Admin (L3) Expected: 20, Actual: ${finalAdmin.totalCommissionEarned}`);

        let success = true;
        if (finalB.totalCommissionEarned !== 50) { log('L1 Commission User B Failed ❌', 'error'); success = false; }
        else log('L1 Commission User B Correct ✅', 'success');

        if (finalA.totalCommissionEarned !== 30) { log('L2 Commission User A Failed ❌', 'error'); success = false; }
        else log('L2 Commission User A Correct ✅', 'success');

        if (finalAdmin.totalCommissionEarned !== 20) { log('L3 Commission Admin Failed ❌', 'error'); success = false; }
        else log('L3 Commission Admin Correct ✅', 'success');

        // Cleanup
        await Plan.findByIdAndDelete(plan._id);

    } catch (err) {
        log(`Test Failed: ${err.message}`, 'error');
        if (err.response) {
            console.log(err.response.data);
        }
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
