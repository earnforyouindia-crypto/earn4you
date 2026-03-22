import connectDB from '@/lib/db';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, phone, walletAddress, password } = await request.json();
        const user = await User.findById(userPayload.id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;

        // Block logic for `walletAddress`
        if (walletAddress) {
            // Already set to a true string value that isn't empty?
            if (user.walletAddress && user.walletAddress !== '') {
                // Return an error to stop execution
                if (walletAddress !== user.walletAddress) {
                    return NextResponse.json(
                        { message: 'Wallet address cannot be changed once set' },
                        { status: 400 }
                    );
                }
            } else {
                user.walletAddress = walletAddress;
            }
        }

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);
        }

        const updatedUser = await user.save();

        return NextResponse.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                phone: updatedUser.phone,
                walletAddress: updatedUser.walletAddress,
                role: updatedUser.role,
                token: signToken(updatedUser._id, updatedUser.role),
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
