import connectDB from '@/lib/db';
import User from '@/models/User';
import { distributeUserRoi } from '@/lib/roi_engine';
import { NextRequest, NextResponse } from 'next/server';

// Security check: Only allow authorized requests
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Simplistic auth check
    if (process.env.NODE_ENV === 'production') {
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ message: 'Unauthorized cron request' }, { status: 401 });
        }
    }

    try {
        await connectDB();

        // Find all active users with active plans
        const activeUsers = await User.find({ 
            isActive: true, 
            planActive: true, 
            plan: { $exists: true, $ne: null } 
        });

        let distributedCount = 0;
        let successfulProfit = 0;

        for (const user of activeUsers) {
            const result = await distributeUserRoi(user._id.toString());
            if (result.success) {
                distributedCount++;
                successfulProfit += result.amount;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'ROI Distribution completed successfully',
            stats: {
                usersProcessed: activeUsers.length,
                roiDistributedTo: distributedCount,
                totalDistributed: successfulProfit
            }
        });

    } catch (error) {
        console.error('Daily ROI Cron Error:', error);
        return NextResponse.json({ message: 'Server error during distribution', error: (error as Error).message }, { status: 500 });
    }
}
