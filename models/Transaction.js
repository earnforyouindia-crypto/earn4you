import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'plan_purchase',
        'daily_return',
        'referral_bonus_l1',
        'referral_bonus_l2',
        'referral_bonus_l3',
        'admin_adjustment',
        'refund_withdrawal'
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // Payment ID or Withdrawal ID
    },
    details: {
      type: Object, // Extra metadata like { fromUser: 'username' }
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
