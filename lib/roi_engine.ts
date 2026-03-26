import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';

type RoiResult = 
    | { success: true; amount: number; cycles: number }
    | { success: false; message: string };

/**
 * Distributes ROI for a single user if 24 hours have passed since the last distribution.
 * Handles multiple missed cycles (e.g., if user returns after 3 days).
 * 
 * @param userId - The ID of the user to process
 * @returns Object containing status and profit distributed
 */
export async function distributeUserRoi(userId: string): Promise<RoiResult> {
    const user = await User.findById(userId).populate('plan');
    if (!user || !user.isActive || !user.planActive || !user.plan) {
        return { success: false, message: 'User not eligible for ROI' };
    }

    if (!user.lastRoiDistribution || !user.planStartDate) {
        // If it's a new plan, initialize lastRoiDistribution to today
        if (!user.lastRoiDistribution) {
            user.lastRoiDistribution = new Date();
            await user.save();
        }
        return { success: false, message: 'ROI not yet due' };
    }

    const now = new Date();
    const plan = user.plan;

    // 1. Expiration Check
    const planDurationDays = user.planDurationDays || plan.duration || 30;
    const expirationDate = new Date(user.planStartDate.getTime() + planDurationDays * 24 * 60 * 60 * 1000);

    if (now >= expirationDate) {
        user.planActive = false;
        await user.save();
        return { success: false, message: 'Plan expired' };
    }

    // 2. 24h Cycle Check
    const hoursSinceLastDistribution = (now.getTime() - user.lastRoiDistribution.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastDistribution < 24) {
        return { success: false, message: 'ROI already distributed within last 24h' };
    }

    // 3. Calculate Profit & Cap
    const cyclesMissed = Math.floor(hoursSinceLastDistribution / 24);
    const maxEarnings = plan.price * 3;
    let currentEarnings = user.earnedFromPlan || 0;

    if (currentEarnings >= maxEarnings) {
        user.planActive = false;
        await user.save();
        return { success: false, message: 'Earning cap reached' };
    }

    const dailyProfit = plan.dailyProfit * cyclesMissed;
    const remainingCap = maxEarnings - currentEarnings;
    const profitToDistribute = Math.min(dailyProfit, remainingCap);

    if (profitToDistribute > 0) {
        // Update User
        user.roiBalance = (user.roiBalance || 0) + profitToDistribute;
        user.totalEarnings = (user.totalEarnings || 0) + profitToDistribute;
        user.earnedFromPlan = currentEarnings + profitToDistribute;
        
        // Strict 24h interval advancement
        user.lastRoiDistribution = new Date(user.lastRoiDistribution.getTime() + (cyclesMissed * 24 * 60 * 60 * 1000));

        // Expire if cap hit
        if (user.earnedFromPlan >= maxEarnings) {
            user.planActive = false;
        }

        await user.save();

        // Log Transaction
        await Transaction.create({
            userId: user._id,
            amount: profitToDistribute,
            type: 'daily_return',
            description: `Daily ROI from ${plan.name} (${cyclesMissed} cycles)`,
            status: 'completed',
        });

        return { success: true, amount: profitToDistribute, cycles: cyclesMissed };
    }

    return { success: false, message: 'No profit to distribute' };
}
