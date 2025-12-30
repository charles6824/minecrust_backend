const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const generateWalletId = () => {
  return 'MCT' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

const addWalletIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const usersWithoutWalletId = await User.find({ walletId: { $exists: false } });
    console.log(`Found ${usersWithoutWalletId.length} users without walletId`);

    for (const user of usersWithoutWalletId) {
      let walletId;
      let isUnique = false;
      
      // Generate unique walletId
      while (!isUnique) {
        walletId = generateWalletId();
        const existing = await User.findOne({ walletId });
        if (!existing) {
          isUnique = true;
        }
      }
      
      user.walletId = walletId;
      await user.save();
      console.log(`Added walletId ${walletId} to user ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addWalletIds();