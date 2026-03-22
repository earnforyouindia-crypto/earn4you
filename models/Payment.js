import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USDT',
        },
        transactionHash: {
            type: String,
            required: false, // Optional now
        },
        walletAddress: {
            type: String,
            required: false,
        },
        screenshotUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'verified', 'failed'],
            default: 'pending',
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Admin user
        },
        verificationNotes: String,
        referralBonus: {
            type: Number,
            default: 0,
        },
        referredByUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        verifiedAt: Date,
    },
    { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
