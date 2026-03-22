import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json({ message: 'Please provide phone number and password' }, { status: 400 });
        }

        // 1. Check for user
        const user = await User.findOne({ phone }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Check password
        const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Generate token
        const token = signToken(user._id, user.role);

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                phone: user.phone,
                walletAddress: user.walletAddress,
                plan: user.plan,
                paymentStatus: user.paymentStatus,
                referralCode: user.referralCode,
                role: user.role,
            },
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
