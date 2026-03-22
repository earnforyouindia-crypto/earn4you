const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Schema } = mongoose;

// Mongoose Models (Simplified for script usage if needed, but we rely mostly on API)
// actually we need direct DB access to clean up or force admin role
const UserSchema = new Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const TransactionSchema = new Schema({}, { strict: false });
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const API_URL = 'http://127.0.0.1:3000/api';
let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let transactionId = '';

const color = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

async function log(msg, type = 'info') {
    const c = type === 'success' ? color.green : type === 'error' ? color.red : type === 'warn' ? color.yellow : color.blue;
    console.log(`${c}[TEST] ${msg}${color.reset}`);
}

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
}

async function cleanData() {
    await connectDB();
    await User.deleteMany({ phone: { $in: ['9999999999', '8888888888'] } });
    await Transaction.deleteMany({ 'details.upiId': 'test@upi' }); // naive cleanup
    log('Cleaned up previous test data.', 'warn');
}

async function runTest() {
    try {
        await cleanData();

        // 1. Register Admin User
        log('1. Registering Admin User...');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Admin',
                phone: '9999999999',
                password: 'password123',
                walletAddress: '0xAdmin'
            });
            adminToken = res.data.token;
            adminId = res.data.user.id;
            log('Admin Registered ✅', 'success');

            // Force Admin Role manually in DB
            await User.findByIdAndUpdate(adminId, { role: 'admin' });
            // Re-login to get admin token
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                phone: '9999999999',
                password: 'password123'
            });
            adminToken = loginRes.data.token;
            log('Admin Promoted and Re-logged in ✅', 'success');

        } catch (e) {
            log(`Admin Registration Failed: ${e.message}`, 'error');
            if (e.response) {
                console.log('Response Status:', e.response.status);
                console.log('Response Data:', JSON.stringify(e.response.data, null, 2));
            }
            return;
        }

        // 2. Register Normal User (referred by Admin)
        log('2. Registering Normal User...');
        try {
            // Get Admin Referral Code
            const adminUser = await User.findById(adminId);
            const refCode = adminUser.referralCode;

            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                phone: '8888888888',
                password: 'password123',
                referralCode: refCode
            });
            userToken = res.data.token;
            userId = res.data.user.id;
            log('User Registered (Ref by Admin) ✅', 'success');
        } catch (e) {
            log(`User Registration Failed: ${e.message}`, 'error');
            return;
        }

        // 3. User: Update Profile
        log('3. Testing Profile Update...');
        try {
            const res = await axios.put(`${API_URL}/user/profile`, {
                name: 'Updated Test User',
                walletAddress: '0xUserUpdated'
            }, { headers: { Authorization: `Bearer ${userToken}` } });

            if (res.data.data.name === 'Updated Test User') {
                log('Profile Updated ✅', 'success');
            } else {
                log('Profile Update Mismatch ❌', 'error');
            }
        } catch (e) {
            log(`Profile Update Failed: ${e.message}`, 'error');
        }

        // 4. User: Fetch Plans
        log('4. Fetching Plans...');
        try {
            const res = await axios.get(`${API_URL}/plans`);
            if (res.data.success) {
                log(`Fetched ${res.data.data.length} Plans ✅`, 'success');
            }
        } catch (e) {
            log(`Fetch Plans Failed: ${e.message}`, 'error');
        }

        // 5. User: Initiate Deposit (Simulate Plan Purchase/Add Funds)
        // Since we don't have a direct "Deposit" API documented in my memory trace, 
        // I recall /api/payments/initiate or manual transaction creation.
        // Let's create a manual transaction record via API if exists, or simulated.
        // There is /api/payments/initiate usually.
        // Let's assume we use a manual deposit flow.
        // Actually, we can just Insert a Transaction directly to test the Admin Verify flow, 
        // IF the API requires a planId.

        // Let's try to hit /api/user/dashboard first
        log('5. Fetching User Dashboard...');
        try {
            const res = await axios.get(`${API_URL}/user/dashboard`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            if (res.data.success) {
                log('User Dashboard Access ✅', 'success');
            }
        } catch (e) {
            log(`Dashboard Access Failed: ${e.message}`, 'error');
        }

    } catch (err) {
        log(`Fatal Error: ${err.message}`, 'error');
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
