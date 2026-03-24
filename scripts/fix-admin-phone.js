const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.error('No admin found!');
        process.exit(1);
    }

    console.log(`Current Admin Phone: ${admin.phone}`);
    
    if (admin.phone === '9999999999') {
        admin.phone = '919999999999';
        await admin.save();
        console.log(`Updated Admin Phone to: ${admin.phone}`);
    } else {
        console.log('Admin phone already has a different format or is already fixed.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fix();
