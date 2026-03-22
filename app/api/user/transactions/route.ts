import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await Transaction.find({ userId: userPayload.id })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: transactions,
        }, { status: 200 });

    } catch (error) {
        console.error('User Transactions Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
