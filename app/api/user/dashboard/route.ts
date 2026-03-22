import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userPayload.id)
            .populate({ path: 'plan', model: Plan })
            .populate('referredBy');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
                stats: {
                    totalEarnings: user.totalEarnings,
                    totalDeposit: user.totalDeposit || 0,
                    commissionBalance: user.commissionBalance || 0,
                    roiBalance: user.roiBalance || 0,
                    withdrawalThreshold: user.withdrawalThreshold,
                    isEligibleForWithdrawal: (user.commissionBalance || 0) >= user.withdrawalThreshold,
                },
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Dashboard Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
