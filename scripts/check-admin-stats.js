const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Minimal Schemas
const UserSchema = new mongoose.Schema({ 
    isActive: Boolean,
    role: String
});
const PaymentSchema = new mongoose.Schema({
    status: String,
    amount: Number
});
const WithdrawalSchema = new mongoose.Schema({
    status: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', WithdrawalSchema);

async function checkStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const verifiedPayments = await Payment.countDocuments({ status: 'verified' });
        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
        
        const totalRevenueResult = await Payment.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        console.log('--- Admin Stats Verification ---');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Active Users: ${activeUsers}`);
        console.log(`Pending Payments: ${pendingPayments}`);
        console.log(`Verified Payments: ${verifiedPayments}`);
        console.log(`Pending Withdrawals: ${pendingWithdrawals}`);
        console.log(`Total Revenue: ${totalRevenue}`);
        console.log('--------------------------------');

    } catch (error) {
        console.error('Error checking stats:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkStats();
