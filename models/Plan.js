import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USDT',
    },
    dailyProfit: {
      type: Number,
      required: true,
    },
    monthlyProfit: {
      type: Number,
      required: true,
    },
    referralCommission: {
      type: Number,
      required: true,
      // percentage of payment amount that referrer gets
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model('Plan', planSchema);
