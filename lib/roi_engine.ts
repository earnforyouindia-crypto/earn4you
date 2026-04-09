import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';

type RoiResult = 
    | { success: true; amount: number; cycles: number }
    | { success: false; message: string };

/**
 * Gets a Date object representing the start of the day (00:00:00) in Indian Standard Time (IST)
 */
function getStartOfIstDay(date: Date): Date {
    // Offset for IST (UTC + 5:30)
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffsetMs);
    
    // Reset to start of day in IST
    istDate.setUTCHours(0, 0, 0, 0);
    
    // Return the "True" UTC time that corresponds to this IST 00:00
    return new Date(istDate.getTime() - istOffsetMs);
}

/**
 * Distributes ROI for a user based on Indian Standard Time (IST) calendar days.
 * Includes Optimistic Concurrency Control (OCC) to prevent double rewards.
 * Expires only when earnings reach 3x (300%) of plan price.
 */
export async function distributeUserRoi(userId: string): Promise<RoiResult> {
    const user = await User.findById(userId).populate('plan');
    if (!user || !user.isActive || !user.planActive || !user.plan) {
        return { success: false, message: 'User not eligible for ROI' };
    }

    const now = new Date();
    const plan = user.plan;

    // Initialization for new users
    if (!user.lastRoiDistribution || !user.planStartDate) {
        if (!user.lastRoiDistribution) {
            // First time: Initialize to today's start in IST (so they get reward tomorrow)
            user.lastRoiDistribution = getStartOfIstDay(now);
            await user.save();
        }
        return { success: false, message: 'ROI initialization cycle' };
    }

    // 1. Calculate Calendar Days Passed (IST 00:00 to 00:00)
    const currentIstMidnight = getStartOfIstDay(now);
    const lastIstMidnight = getStartOfIstDay(user.lastRoiDistribution);

    // Difference in milliseconds divided by milliseconds in a day
    const msInDay = 24 * 60 * 60 * 1000;
    const daysPassed = Math.floor((currentIstMidnight.getTime() - lastIstMidnight.getTime()) / msInDay);

    if (daysPassed < 1) {
        return { success: false, message: 'Already paid or not due yet today (IST midnight reset)' };
    }

    // 2. 3x Cap Logic
    const maxEarnings = plan.price * 3;
    let totalEarnedSoFar = user.earnedFromPlan || 0;

    if (totalEarnedSoFar >= maxEarnings) {
        // Double-check: Make sure the plan is actually marked inactive if this happens
        if (user.planActive) {
            await User.updateOne({ _id: userId }, { $set: { planActive: false } });
        }
        return { success: false, message: 'Earning cap (3x) already reached' };
    }

    // 3. Calculate Reward
    const totalDue = plan.dailyProfit * daysPassed;
    const remainingToCap = maxEarnings - totalEarnedSoFar;
    const profitToDistribute = Math.min(totalDue, remainingToCap);

    if (profitToDistribute > 0) {
        /** 
         * OPTIMISTIC CONCURRENCY CONTROL (OCC)
         * We filter the update by `lastRoiDistribution`.
         * If another process already updated the user, the timestamp won't match, and modifiedCount will be 0.
         */
        const updateFilter = {
            _id: userId,
            lastRoiDistribution: user.lastRoiDistribution, // THE LOCK
            planActive: true
        };

        const updateData = {
            $inc: { 
                roiBalance: profitToDistribute, 
                availableBalance: profitToDistribute, 
                totalEarnings: profitToDistribute, 
                earnedFromPlan: profitToDistribute 
            },
            $set: { 
                lastRoiDistribution: currentIstMidnight,
                // Automatically set planActive to false IF reaching cap
                planActive: (totalEarnedSoFar + profitToDistribute) < maxEarnings
            }
        };

        const updateResult = await User.updateOne(updateFilter, updateData);

        // If no document was modified, someone else already processed this reward
        if (updateResult.modifiedCount === 0) {
            return { success: false, message: 'ROI already processed by another request (Atomic Lock)' };
        }

        // 4. Create Transaction Log (Only if database update succeeded)
        await Transaction.create({
            userId: user._id,
            amount: profitToDistribute,
            type: 'daily_return',
            description: `Daily ROI from ${plan.name} (${daysPassed} days catch-up, IST Midnight Reset)`,
            status: 'completed',
            // Store the timestamp cycle in metadata for debugging
            details: {
                cycle: currentIstMidnight.toISOString(),
                daysPassed
            }
        });

        return { success: true, amount: profitToDistribute, cycles: daysPassed };
    }

    return { success: false, message: 'No profit to distribute' };
}
