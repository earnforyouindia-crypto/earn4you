import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ paymentId: string }> }) {
    try {
        const params = await props.params;
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const admin = await User.findById(userPayload.id);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const { verificationNotes } = await request.json();
        const paymentId = params.paymentId;

        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            {
                status: 'failed',
                verifiedBy: admin._id,
                verificationNotes,
                verifiedAt: new Date(),
            },
            { new: true }
        );

        if (!payment) {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }

        // Also update the User's payment status to 'failed' so the dashboard reflects the rejection
        await User.findByIdAndUpdate(payment.userId, { paymentStatus: 'failed' });

        return NextResponse.json({
            success: true,
            message: 'Payment rejected',
            data: payment,
        }, { status: 200 });

    } catch (error) {
        console.error('Reject Payment Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
