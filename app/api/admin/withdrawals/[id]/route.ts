import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        await connectDB();

        // Admin authentication
        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const adminUser = await User.findById(userPayload.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const withdrawalId = params.id;
        const { action } = await request.json(); // receive action

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');
        if (!withdrawal) {
            return NextResponse.json({ message: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ message: 'Withdrawal already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            withdrawal.status = 'completed';
            // Here might be an integration with external gateway if required, but local db update for MVP:
        } else if (action === 'reject') {
            withdrawal.status = 'rejected';

            // Refund the user balance if rejected
            const user = await User.findById(withdrawal.userId);
            if (user) {
                user.commissionBalance += withdrawal.amount; // Use the raw amount added back
                await user.save();

                // Add refund transaction log
                await Transaction.create({
                    userId: user._id,
                    amount: withdrawal.amount,
                    type: 'refund_withdrawal',
                    description: `Refund for rejected withdrawal request`,
                    referenceId: withdrawal._id
                });
            }
        }

        await withdrawal.save();

        return NextResponse.json({
            success: true,
            message: `Withdrawal successfully ${action}d`
        });

    } catch (error) {
        console.error('Withdrawal Update Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
