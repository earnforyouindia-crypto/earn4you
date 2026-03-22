import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // Changed from true
      unique: true,
      sparse: true, // Added sparse so null/undefined values don't conflict
      lowercase: true,
    },
    phone: {
      type: String,
      required: true, // Changed from false/implicit
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      required: false,
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    planStartDate: {
      type: Date,
    },
    planActive: {
      type: Boolean,
      default: false,
    },
    earnedFromPlan: {
      type: Number,
      default: 0,
      // Tracks earnings from daily ROI to cap at 3x
    },
    planDurationDays: {
      type: Number,
      default: null,
    },
    lastRoiDistribution: {
      type: Date,
      default: null,
    },
    totalCommissionEarned: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
    },
    availableBalance: { // Keeping for legacy/migration or generic use, but logic will shift
      type: Number,
      default: 0,
    },
    commissionBalance: { // Withdrawable
      type: Number,
      default: 0,
    },
    roiBalance: { // Non-withdrawable daily returns
      type: Number,
      default: 0,
    },
    withdrawalThreshold: {
      type: Number,
      default: 10, // User can withdraw after earning 10 USDT
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
