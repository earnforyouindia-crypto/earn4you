import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        }, { status: 200 });

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Expire immediately
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ message: "Server error during logout" }, { status: 500 });
    }
}
