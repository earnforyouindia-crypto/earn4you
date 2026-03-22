import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
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

        const users = await User.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'plan', model: Plan })
            .populate('referredBy')
            .select('-password');

        return NextResponse.json({
            success: true,
            data: users,
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Users Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
