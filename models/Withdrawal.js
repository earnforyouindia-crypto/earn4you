import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Gross amount requested by user
    },
    fee: {
      type: Number,
      required: true,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true, // Amount to be sent (Amount - Fee)
    },
    walletAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
      default: 'pending',
    },
    transactionHash: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin user
    },
    rejectionReason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
