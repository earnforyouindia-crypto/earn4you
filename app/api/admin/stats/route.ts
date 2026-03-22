import connectDB from '@/lib/db';
import User from '@/models/User';
import Payment from '@/models/Payment';
import Withdrawal from '@/models/Withdrawal';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const user = await User.findById(userPayload.id);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const verifiedPayments = await Payment.countDocuments({ status: 'verified' });
        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
        const totalRevenueResult = await Payment.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                pendingPayments,
                verifiedPayments,
                pendingWithdrawals,
                totalRevenue: totalRevenueResult[0]?.total || 0,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
