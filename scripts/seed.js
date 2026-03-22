import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import models
// Note: We need to import them dynamically or assume the script is run with node
import User from '../models/User.js';
import Plan from '../models/Plan.js';

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    // We wipe Plans to insert the updated tier list, but we DO NOT delete Users.
    await Plan.deleteMany({});
    console.log('Cleared existing database (Plans only)');

    // Create plans
    const plans = [
      {
        name: 'Plan 10',
        price: 10,
        dailyProfit: 1,
        monthlyProfit: 30,
        currency: 'USDT',
        referralCommission: 10,
        description: 'Daily profit $1, Monthly profit $30',
        features: ['Low entry barrier', 'Instant withdrawal'],
      },
      {
        name: 'Plan 30',
        price: 30,
        dailyProfit: 3,
        monthlyProfit: 90,
        currency: 'USDT',
        referralCommission: 10,
        description: 'Daily profit $3, Monthly profit $90',
        features: ['Standard returns', '24/7 Support'],
      },
      {
        name: 'Plan 50',
        price: 50,
        dailyProfit: 5,
        monthlyProfit: 150,
        currency: 'USDT',
        referralCommission: 10,
        description: 'Daily profit $5, Monthly profit $150',
        features: ['Higher limits', 'Priority support'],
      },
      {
        name: 'Plan 100',
        price: 100,
        dailyProfit: 10,
        monthlyProfit: 300,
        currency: 'USDT',
        referralCommission: 12,
        description: 'Daily profit $10, Monthly profit $300',
        features: ['Advanced earnings', 'Premium access'],
      },
      {
        name: 'Plan 200',
        price: 200,
        dailyProfit: 20,
        monthlyProfit: 600,
        currency: 'USDT',
        referralCommission: 12,
        description: 'Daily profit $20, Monthly profit $600',
        features: ['Silver Tier', 'Dedicated Manager'],
      },
      {
        name: 'Plan 500',
        price: 500,
        dailyProfit: 50,
        monthlyProfit: 1500,
        currency: 'USDT',
        referralCommission: 12,
        description: 'Daily profit $50, Monthly profit $1500',
        features: ['Gold Tier', 'Weekly bonuses'],
      },
      {
        name: 'Plan 1000',
        price: 1000,
        dailyProfit: 100,
        monthlyProfit: 3000,
        currency: 'USDT',
        referralCommission: 15,
        description: 'Daily profit $100, Monthly profit $3000',
        features: ['Platinum Tier', 'Zero fees'],
      },
      {
        name: 'Plan 2000',
        price: 2000,
        dailyProfit: 200,
        monthlyProfit: 6000,
        currency: 'USDT',
        referralCommission: 15,
        description: 'Daily profit $200, Monthly profit $6000',
        features: ['Diamond Tier', 'Exclusive events'],
      },
      {
        name: 'Plan 5000',
        price: 5000,
        dailyProfit: 500,
        monthlyProfit: 15000,
        currency: 'USDT',
        referralCommission: 15,
        description: 'Daily profit $500, Monthly profit $15000',
        features: ['Elite Tier', 'Private auditing'],
      },
      {
        name: 'Plan 10000',
        price: 10000,
        dailyProfit: 1000,
        monthlyProfit: 30000,
        currency: 'USDT',
        referralCommission: 15,
        description: 'Daily profit $1000, Monthly profit $30000',
        features: ['Partner Tier', 'Shareholder access'],
      },
    ];

    const createdPlans = await Plan.insertMany(plans);
    console.log('Plans created:', createdPlans.length);

    // Create Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@earn4you.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);

    const admin = new User({
        name: 'Admin User',
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        walletAddress: 'admin_wallet_TRC20',
        referralCode: 'ADMIN01',
        isActive: true,
        role: 'admin',
    });

    await admin.save();
    console.log('Admin user created successfully.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
