const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  referralCode: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const phone = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Admin User';

    if (!phone || !password) {
      console.error('Usage: node scripts/create-admin.js <phone> <password> [name]');
      process.exit(1);
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log('User already exists with this phone number. Updating role to admin...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('User role updated to admin.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = `admin${Math.floor(1000 + Math.random() * 9000)}`;
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const admin = await User.create({
      name,
      username,
      phone,
      password: hashedPassword,
      role: 'admin',
      referralCode,
      isActive: true,
    });

    console.log(`Admin created successfully: ${admin.name} (${admin.phone})`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
