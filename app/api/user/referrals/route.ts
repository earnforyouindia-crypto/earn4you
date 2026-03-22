import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userPayload = await authenticate(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userPayload.id);

        // --- Helper function to enrich users with earnings ---
        const enrichWithEarnings = async (users: any[], levelType: string) => {
            return await Promise.all(users.map(async (refUser) => {
                const earnings = await Transaction.aggregate([
                    {
                        $match: {
                            userId: userPayload.id, // My earnings
                            type: levelType, // 'referral_bonus_l1', 'referral_bonus_l2', etc.
                            'details.fromUser': refUser.username
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);
                return {
                    ...refUser.toObject(),
                    earningsGenerated: earnings[0]?.total || 0,
                    level: levelType === 'referral_bonus_l1' ? 1 : levelType === 'referral_bonus_l2' ? 2 : 3
                };
            }));
        };

        // --- Level 1 ---
        const l1Users = await User.find({ referredBy: userPayload.id })
            .select('name username phone email plan totalEarnings createdAt')
            .populate('plan', 'name');
        const l1Enriched = await enrichWithEarnings(l1Users, 'referral_bonus_l1');

        // --- Level 2 ---
        const l1Ids = l1Users.map(u => u._id);
        const l2Users = l1Ids.length > 0
            ? await User.find({ referredBy: { $in: l1Ids } })
                .select('name username phone email plan totalEarnings createdAt referredBy')
                .populate('plan', 'name')
            : [];
        const l2Enriched = await enrichWithEarnings(l2Users, 'referral_bonus_l2');

        // --- Level 3 ---
        const l2Ids = l2Users.map(u => u._id);
        const l3Users = l2Ids.length > 0
            ? await User.find({ referredBy: { $in: l2Ids } })
                .select('name username phone email plan totalEarnings createdAt referredBy')
                .populate('plan', 'name')
            : [];
        const l3Enriched = await enrichWithEarnings(l3Users, 'referral_bonus_l3');

        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;

        return NextResponse.json({
            success: true,
            data: {
                referralCode: user.referralCode,
                referralLink: `${baseUrl}/register?ref=${user.referralCode}`,
                stats: {
                    l1Count: l1Users.length,
                    l2Count: l2Users.length,
                    l3Count: l3Users.length,
                    totalCount: l1Users.length + l2Users.length + l3Users.length
                },
                referrals: {
                    l1: l1Enriched,
                    l2: l2Enriched,
                    l3: l3Enriched
                }
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Referrals Error:', error);
        return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
    }
}
