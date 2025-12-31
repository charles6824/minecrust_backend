const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const InvestmentPackage = require('./models/InvestmentPackage');
const Settings = require('./models/Settings');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-investment');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await InvestmentPackage.deleteMany({});
    await Settings.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@minecrusttrading.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      balance: 0,
      hasCompletedSetup: true,
      isActive: true
    });
    await admin.save();
    console.log('Admin user created');

    // Create sample users
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isVerified: true,
        balance: 0,
        cryptoWallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        hasCompletedSetup: true,
        isActive: true,
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        walletType: 'Bitcoin'
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        isVerified: true,
        balance: 0,
        cryptoWallet: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
        hasCompletedSetup: true,
        isActive: true,
        phone: '+1234567891',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        country: 'USA',
        walletType: 'Ethereum'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log('Sample users created');

    // Create investment packages
    const packages = [
      {
        name: 'Starter Package',
        description: 'Perfect for beginners looking to start their investment journey with guaranteed daily returns.',
        minAmount: 100,
        maxAmount: 1999,
        duration: 5,
        roi: 5,
        isActive: true,
        createdBy: admin._id,
        features: ['24/7 Support', '1% Daily Returns', 'Low Risk', '5 Day Duration'],
        riskLevel: 'low'
      },
      {
        name: 'Professional Package',
        description: 'For experienced investors seeking higher daily returns with professional portfolio management.',
        minAmount: 2000,
        maxAmount: 5999,
        duration: 5,
        roi: 10,
        isActive: true,
        createdBy: admin._id,
        features: ['Priority Support', '2% Daily Returns', 'Portfolio Management', '5 Day Duration'],
        riskLevel: 'medium'
      },
      {
        name: 'Advance Package',
        description: 'Advanced investment package with premium returns for serious investors.',
        minAmount: 6000,
        maxAmount: 9999,
        duration: 5,
        roi: 15,
        isActive: true,
        createdBy: admin._id,
        features: ['VIP Support', '3% Daily Returns', 'Advanced Analytics', '5 Day Duration'],
        riskLevel: 'medium'
      },
      {
        name: 'Elite Package',
        description: 'Premium package with maximum daily returns for VIP investors with exclusive benefits.',
        minAmount: 10000,
        maxAmount: 49999,
        duration: 5,
        roi: 20,
        isActive: true,
        createdBy: admin._id,
        features: ['VIP Support', '4% Daily Returns', 'Personal Account Manager', 'Exclusive Insights', '5 Day Duration'],
        riskLevel: 'high'
      }
    ];

    for (const packageData of packages) {
      const package = new InvestmentPackage(packageData);
      await package.save();
    }
    console.log('Investment packages created');

    // Create system settings
    const settings = [
      {
        key: 'site_name',
        value: 'MineCrustTrading',
        category: 'general',
        description: 'Website name',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'site_description',
        value: 'Professional investment platform specializing in Real Estate, Oil & Gas, Agriculture, and Crypto Mining with guaranteed returns',
        category: 'general',
        description: 'Website description',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'contact_email',
        value: 'support@minecrusttrading.com',
        category: 'general',
        description: 'Contact email address',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'withdrawal_fee',
        value: 2,
        category: 'payment',
        description: 'Withdrawal fee percentage',
        isPublic: false,
        dataType: 'number'
      },
      {
        key: 'min_withdrawal',
        value: 50,
        category: 'payment',
        description: 'Minimum withdrawal amount',
        isPublic: true,
        dataType: 'number'
      },
      {
        key: 'max_withdrawal',
        value: 50000,
        category: 'payment',
        description: 'Maximum withdrawal amount',
        isPublic: true,
        dataType: 'number'
      },
      {
        key: 'default_language',
        value: 'en',
        category: 'language',
        description: 'Default system language',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'supported_languages',
        value: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'ru'],
        category: 'language',
        description: 'Supported languages',
        isPublic: true,
        dataType: 'array'
      },
      {
        key: 'maintenance_mode',
        value: false,
        category: 'general',
        description: 'Enable maintenance mode',
        isPublic: false,
        dataType: 'boolean'
      },
      {
        key: 'registration_enabled',
        value: true,
        category: 'security',
        description: 'Allow new user registrations',
        isPublic: true,
        dataType: 'boolean'
      },
      {
        key: 'tether_address',
        value: 'TDYmqnoV2fVb1ydUpNHR1t1DaW7UkbBg5J',
        category: 'payment',
        description: 'Tether (USDT) payment address',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'solana_address',
        value: 'AWxVag65WMgTiHB5E7SDBr1jwjnWyzuq9dvn6g5y5k4a',
        category: 'payment',
        description: 'Solana (SOL) payment address',
        isPublic: true,
        dataType: 'string'
      },
      {
        key: 'trx_address',
        value: 'TDYmqnoV2fVb1ydUpNHR1t1DaW7UkbBg5J',
        category: 'payment',
        description: 'Tron (TRX) payment address',
        isPublic: true,
        dataType: 'string'
      }
    ];

    for (const settingData of settings) {
      const setting = new Settings(settingData);
      await setting.save();
    }
    console.log('System settings created');

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log("Admin: admin@minecrusttrading.com / admin123");
    console.log('User: john.doe@example.com / password123');
    console.log('User: jane.smith@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;