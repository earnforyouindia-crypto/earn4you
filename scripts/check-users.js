const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const UserSchema = new mongoose.Schema({
  phone: String,
  role: String,
  username: String,
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'phone role username');
    console.log('--- Current Users in DB ---');
    users.forEach(u => {
        console.log(`User: ${u.username} | Role: ${u.role} | Phone: ${u.phone}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
