import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { MIN_WITHDRAWAL_AMOUNT, WITHDRAWAL_FEE_PERCENT } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { amount, walletAddress } = await request.json();
        const withdrawalAmount = Number(amount);

        if (isNaN(withdrawalAmount)) {
            return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        }

        // Check minimum amount
        if (withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
            return NextResponse.json({ message: `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} USDT` }, { status: 400 });
        }

        const user = await User.findById(userPayload.id);

        // Check if user has an active plan
        if (!user.planActive && user.role !== 'admin') {
            return NextResponse.json({
                message: 'You must activate a plan before you can withdraw your commissions.'
            }, { status: 403 });
        }

        // Check if user has enough balance (Commission Balance only)
        if ((user.commissionBalance || 0) < withdrawalAmount) {
            return NextResponse.json({
                message: 'Insufficient commission balance',
                commissionBalance: user.commissionBalance,
            }, { status: 400 });
        }

        // Calculate Fees
        const fee = (withdrawalAmount * WITHDRAWAL_FEE_PERCENT) / 100;
        const netAmount = withdrawalAmount - fee;

        // Deduct Balance Immediately
        user.commissionBalance -= withdrawalAmount;
        await user.save();

        // Create Withdrawal Record
        const withdrawal = await Withdrawal.create({
            userId: userPayload.id,
            amount: withdrawalAmount,
            fee,
            netAmount,
            walletAddress,
        });

        // Create Transaction Record
        await Transaction.create({
            userId: userPayload.id,
            amount: -withdrawalAmount, // Negative for withdrawal
            type: 'withdrawal',
            description: `Withdrawal Request to ${walletAddress.substring(0, 10)}... (Fee: ${fee} USDT)`,
            referenceId: withdrawal._id,
            details: { walletAddress, fee, netAmount }
        });

        return NextResponse.json({
            success: true,
            message: 'Withdrawal request submitted',
            data: withdrawal,
        }, { status: 201 });

    } catch (error) {
        console.error('Withdrawal Request Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
