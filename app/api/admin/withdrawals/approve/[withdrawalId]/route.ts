import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ withdrawalId: string }> }) {
    try {
        const params = await props.params;
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const admin = await User.findById(userPayload.id);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const { transactionHash } = await request.json();
        const withdrawalId = params.withdrawalId;

        const withdrawal = await Withdrawal.findById(withdrawalId);
        if (!withdrawal) {
            return NextResponse.json({ message: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ message: 'Withdrawal already processed' }, { status: 400 });
        }

        withdrawal.status = 'completed';
        withdrawal.transactionHash = transactionHash;
        withdrawal.approvedBy = admin._id;
        withdrawal.completedAt = new Date();

        await withdrawal.save();

        return NextResponse.json({
            success: true,
            message: 'Withdrawal approved',
            data: withdrawal,
        }, { status: 200 });

    } catch (error) {
        console.error('Approve Withdrawal Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
