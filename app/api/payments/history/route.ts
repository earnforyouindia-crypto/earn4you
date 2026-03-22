import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Plan from '@/models/Plan'; // Ensure Plan is imported
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payments = await Payment.find({ userId: userPayload.id })
            .populate({ path: 'planId', model: Plan })
            .sort({
                createdAt: -1,
            });

        return NextResponse.json({
            success: true,
            data: payments,
        }, { status: 200 });

    } catch (error) {
        console.error('Payment History Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
