import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
    try {
        const params = await props.params;
        await connectDB();
        
        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const admin = await User.findById(userPayload.id);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const { amount, description, type } = await request.json(); // type: 'commission' or 'roi'
        const userId = params.userId;
        const creditAmount = Number(amount);

        if (isNaN(creditAmount) || creditAmount <= 0) {
            return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update Balance
        if (type === 'roi') {
            user.roiBalance = (user.roiBalance || 0) + creditAmount;
            user.earnedFromPlan = (user.earnedFromPlan || 0) + creditAmount;
        } else {
            // Default to commission
            user.commissionBalance = (user.commissionBalance || 0) + creditAmount;
        }

        user.totalEarnings += creditAmount;
        await user.save();

        // Create Transaction
        await Transaction.create({
            userId: user._id,
            amount: creditAmount,
            type: type === 'roi' ? 'daily_return' : 'admin_adjustment', // Changed from bonus to match enum or standard
            // Original controller had 'bonus' but Transaction model enum has 'admin_adjustment'. 
            // Let's use 'admin_adjustment' which is safe.
            description: description || `Admin Credit (${type === 'roi' ? 'ROI' : 'Commission'})`,
            details: { addedBy: admin.username }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully added ${creditAmount} USDT to ${type === 'roi' ? 'ROI' : 'Commission'} balance`,
            data: {
                commissionBalance: user.commissionBalance,
                roiBalance: user.roiBalance
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Add Funds Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
