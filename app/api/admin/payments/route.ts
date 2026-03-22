import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User'; // Ensure User model is registered
import Plan from '@/models/Plan'; // Ensure Plan model is registered
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
        if (status) {
             if (status.toLowerCase() === 'pending') query.status = 'pending';
             else if (status.toLowerCase() === 'approved') query.status = 'verified';
             else if (status.toLowerCase() === 'rejected') query.status = 'failed';
        }

        const payments = await Payment.find(query)
            .populate('userId', 'name username email walletAddress')
            .populate('planId', 'name price')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: payments,
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Payments Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
