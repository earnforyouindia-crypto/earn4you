import connectDB from '@/lib/db';
import Plan from '@/models/Plan';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

        return NextResponse.json({
            success: true,
            data: plans,
        }, { status: 200 });

    } catch (error) {
        console.error('Plans Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
