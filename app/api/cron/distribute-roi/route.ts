import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
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
        const activeUsers = await User.find({ isActive: true, planActive: true }).populate('plan');
        let distributedCount = 0;
        let expiredCount = 0;

        const now = new Date();

        for (const user of activeUsers) {
            if (!user.plan) continue; // Failsafe
            if (!user.lastRoiDistribution || !user.planStartDate) continue; // Required for 24h checks

            const plan = user.plan;

            // 1. Check for Expiration (Has it been > planDurationDays since activation?)
            const planDurationDays = user.planDurationDays || plan.duration || 30; // Default 30 days
            const expirationDate = new Date(user.planStartDate.getTime() + planDurationDays * 24 * 60 * 60 * 1000);

            if (now >= expirationDate) {
                user.planActive = false;
                await user.save();
                expiredCount++;
                continue;
            }

            // 2. Check if 24 hours have passed since the LAST distribution
            const hoursSinceLastDistribution = (now.getTime() - user.lastRoiDistribution.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastDistribution >= 24) {
                // Determine how many full 24-hour periods have passed (usually 1 if cron runs hourly)
                const cyclesMissed = Math.floor(hoursSinceLastDistribution / 24);

                const maxEarnings = plan.price * 3; // The 3x cap limit
                let currentEarnings = user.earnedFromPlan || 0;

                if (currentEarnings >= maxEarnings) {
                    user.planActive = false;
                    await user.save();
                    expiredCount++;
                    continue;
                }

                // Calculate base profit for missed cycles
                const dailyProfit = plan.dailyProfit * cyclesMissed;
                const remainingCap = maxEarnings - currentEarnings;

                // Limit today's profit by the remaining cap space
                const profitToDistribute = Math.min(dailyProfit, remainingCap);

                if (profitToDistribute > 0) {
                    // Add to balances
                    user.roiBalance = (user.roiBalance || 0) + profitToDistribute;
                    user.totalEarnings = (user.totalEarnings || 0) + profitToDistribute;
                    user.earnedFromPlan = currentEarnings + profitToDistribute;

                    // Advance the distribution timestamp by exactly 24 hours per cycle missed
                    // This keeps their billing cycle completely strict regardless of cron delays
                    user.lastRoiDistribution = new Date(user.lastRoiDistribution.getTime() + (cyclesMissed * 24 * 60 * 60 * 1000));

                    // Log Transaction
                    await Transaction.create({
                        userId: user._id,
                        amount: profitToDistribute,
                        type: 'daily_return',
                        description: `Daily ROI from ${plan.name}`,
                        status: 'completed',
                    });

                    distributedCount++;
                }

                // Check 3x Cap again after distribution
                if ((user.earnedFromPlan || 0) >= maxEarnings) {
                    user.planActive = false;
                    expiredCount++;
                }

                await user.save();
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Hourly 24-hr cycle checks completed successfully',
            stats: {
                usersProcessed: activeUsers.length,
                roiDistributedTo: distributedCount,
                plansExpired: expiredCount
            }
        });

    } catch (error) {
        console.error('Daily ROI Cron Error:', error);
        return NextResponse.json({ message: 'Server error during distribution', error: (error as Error).message }, { status: 500 });
    }
}
