import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { generateReferralCode } from '@/lib/utils';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { name, phone, password, walletAddress, referralCode } = await request.json();

        // 1. Check if user exists (phone)
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return NextResponse.json({ message: 'User already exists with this phone number' }, { status: 400 });
        }

        // 2. Check referral code or Default to Admin
        let referredBy = null;
        if (referralCode) {
            console.log('Processing referral code:', referralCode);
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                console.log('Referrer found:', referrer.username);
                referredBy = referrer._id;
            } else {
                console.log('Referrer NOT found for code:', referralCode);
            }
        } else {
            console.log('No referral code provided. Defaulting to Admin.');
            // Find the first admin user
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                console.log('Admin found for default referral:', adminUser.username);
                referredBy = adminUser._id;
            } else {
                console.log('No admin user found to set as default referrer.');
            }
        }

        // 3. Generate unique username (from name or random)
        const namePrefix = name ? name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
        let username = `${namePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
        while (await User.findOne({ username })) {
            username = `${namePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 4. Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 5. Create user
        const user = await User.create({
            name,
            username,
            phone,
            password: hashedPassword,
            walletAddress,
            referredBy,
            referralCode: generateReferralCode(),
        });

        // 6. Generate token
        const token = signToken(user._id, 'user');

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                phone: user.phone,
                referralCode: user.referralCode,
            },
        }, { status: 201 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
