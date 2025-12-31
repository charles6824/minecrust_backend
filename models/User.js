const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *         isVerified:
 *           type: boolean
 *           default: false
 *         balance:
 *           type: number
 *           default: 0
 *         cryptoWallet:
 *           type: string
 *           description: User's crypto wallet address
 *         hasCompletedSetup:
 *           type: boolean
 *           default: false
 *         isActive:
 *           type: boolean
 *           default: true
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         walletType:
 *           type: string
 *         emergencyContact:
 *           type: string
 *         emergencyPhone:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  cryptoWallet: {
    type: String,
    trim: true
  },
  hasCompletedSetup: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', ''],
    trim: true
  },
  walletId: {
    type: String,
    unique: true,
    default: function() {
      // Generate format: MCT + 2 digits + 1 letter (e.g., MCT23A)
      const digits = Math.floor(Math.random() * 90) + 10; // 10-99
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const letter = letters[Math.floor(Math.random() * letters.length)];
      return `MCT${digits}${letter}`;
    }
  },
  walletType: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  emergencyPhone: {
    type: String,
    trim: true
  },
  withdrawalAddresses: {
    tether: String,
    solana: String,
    trx: String
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if profile setup is complete
userSchema.methods.isProfileComplete = function() {
  const hasBasicInfo = this.firstName && this.lastName && this.phone && this.address && this.city && this.country && this.gender;
  const hasWithdrawalMethod = this.withdrawalAddresses && 
    (this.withdrawalAddresses.tether || this.withdrawalAddresses.solana || this.withdrawalAddresses.trx);
  return hasBasicInfo && hasWithdrawalMethod;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.verificationToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);