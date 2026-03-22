import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { REFERRAL_L1_PERCENT, REFERRAL_L2_PERCENT, REFERRAL_L3_PERCENT } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ paymentId: string }> }) {
    try {
        const params = await props.params;
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const admin = await User.findById(userPayload.id);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
        }

        const { verificationNotes } = await request.json();
        const paymentId = params.paymentId;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }

        if (payment.status === 'verified') {
            return NextResponse.json({ message: 'Payment already verified' }, { status: 400 });
        }

        // Update payment status
        payment.status = 'verified';
        payment.verifiedBy = admin._id;
        payment.verifiedAt = new Date();
        payment.verificationNotes = verificationNotes || 'Verified by Admin';

        // Get plan details
        const plan = await Plan.findById(payment.planId);

        // Update user
        const user = await User.findById(payment.userId);
        user.plan = payment.planId;
        user.paymentStatus = 'completed';
        user.isActive = true;
        user.planActive = true;

        const activationTime = new Date();
        user.planStartDate = activationTime;
        user.lastRoiDistribution = activationTime;
        user.planDurationDays = plan ? plan.duration : 30; // fallback to 30
        user.earnedFromPlan = 0;

        // Update Total Deposit
        if (plan) {
            user.totalDeposit = (user.totalDeposit || 0) + plan.price;
        }

        const planPrice = plan ? plan.price : payment.amount;

        // --- MLM Referral Logic (3 Levels) ---

        // Level 1 (Direct Referrer)
        if (user.referredBy) {
            const referrerL1 = await User.findById(user.referredBy);

            // Give commission to referrer regardless of plan status
            if (referrerL1) {
                const commissionL1 = (planPrice * REFERRAL_L1_PERCENT) / 100;

                referrerL1.totalEarnings += commissionL1;
                referrerL1.commissionBalance = (referrerL1.commissionBalance || 0) + commissionL1;
                referrerL1.totalCommissionEarned += commissionL1;
                await referrerL1.save();

                // Transaction Record L1
                await Transaction.create({
                    userId: referrerL1._id,
                    amount: commissionL1,
                    type: 'referral_bonus_l1',
                    description: `Level 1 Commission from ${user.username}`,
                    referenceId: payment._id,
                    details: { fromUser: user.username, level: 1 }
                });

                // Update Payment with L1 info
                payment.referralBonus = commissionL1;
                payment.referredByUser = referrerL1._id;

                // Level 2
                if (referrerL1.referredBy) {
                    const referrerL2 = await User.findById(referrerL1.referredBy);
                    if (referrerL2) {
                        const commissionL2 = (planPrice * REFERRAL_L2_PERCENT) / 100;

                        referrerL2.totalEarnings += commissionL2;
                        referrerL2.commissionBalance = (referrerL2.commissionBalance || 0) + commissionL2;
                        referrerL2.totalCommissionEarned += commissionL2;
                        await referrerL2.save();

                        await Transaction.create({
                            userId: referrerL2._id,
                            amount: commissionL2,
                            type: 'referral_bonus_l2',
                            description: `Level 2 Commission from ${user.username} (via ${referrerL1.username})`,
                            referenceId: payment._id,
                            details: { fromUser: user.username, riskSource: referrerL1.username, level: 2 }
                        });

                        // Level 3
                        if (referrerL2.referredBy) {
                            const referrerL3 = await User.findById(referrerL2.referredBy);
                            if (referrerL3) {
                                const commissionL3 = (planPrice * REFERRAL_L3_PERCENT) / 100;

                                referrerL3.totalEarnings += commissionL3;
                                referrerL3.commissionBalance = (referrerL3.commissionBalance || 0) + commissionL3;
                                referrerL3.totalCommissionEarned += commissionL3;
                                await referrerL3.save();

                                await Transaction.create({
                                    userId: referrerL3._id,
                                    amount: commissionL3,
                                    type: 'referral_bonus_l3',
                                    description: `Level 3 Commission from ${user.username} (via ${referrerL2.username})`,
                                    referenceId: payment._id,
                                    details: { fromUser: user.username, riskSource: referrerL2.username, level: 3 }
                                });
                            }
                        }
                    }
                }
            }
        }

        await payment.save();
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully and commissions distributed',
            data: payment,
        }, { status: 200 });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
