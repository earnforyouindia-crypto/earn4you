import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const admin = await User.findById(userPayload.id);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: any = {};
        if (status && status.toLowerCase() !== 'all') {
            query.status = status.toLowerCase();
        }

        const withdrawals = await Withdrawal.find(query)
            .populate('userId', 'name username email phone walletAddress')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: withdrawals,
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Withdrawals Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
