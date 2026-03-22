const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String },
  email: { type: String },
  phone: { type: String },
  referralCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const checkReferral = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the most recently created user
    const user = await User.findOne().sort({ createdAt: -1 }).populate('referredBy');

    if (!user) {
      console.log('No users found.');
      return;
    }

    console.log('Last Registered User:');
    console.log(`- ID: ${user._id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Phone: ${user.phone}`);
    console.log(`- Referral Code: ${user.referralCode}`);
    
    if (user.referredBy) {
      console.log('Referred By:');
      console.log(`- ID: ${user.referredBy._id}`);
      console.log(`- Username: ${user.referredBy.username}`);
      console.log(`- Referral Code: ${user.referredBy.referralCode}`);
      console.log('✅ Referral link established successfully.');
    } else {
      console.log('❌ referredBy is null. User was NOT referred.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkReferral();
