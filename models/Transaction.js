const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - amount
 *         - method
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated transaction ID
 *         userId:
 *           type: string
 *           description: User ID who initiated the transaction
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal, investment, return, bonus]
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, processing]
 *         method:
 *           type: string
 *           enum: [crypto, paypal, bank_transfer]
 *         reference:
 *           type: string
 *           description: Transaction reference/hash
 *         adminNotes:
 *           type: string
 *           description: Admin notes for the transaction
 *         processedBy:
 *           type: string
 *           description: Admin user ID who processed the transaction
 *         processedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'investment', 'return', 'bonus', 'transfer_out', 'transfer_in'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['crypto', 'paypal', 'bank_transfer', 'internal', 'btc', 'eth', 'usdt', 'trx', 'sol'],
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  walletAddress: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number
  }
}, {
  timestamps: true
});

// Calculate net amount after fees
transactionSchema.pre('save', function(next) {
  if (this.type === 'withdrawal' && this.fee > 0) {
    this.netAmount = this.amount - this.fee;
  } else {
    this.netAmount = this.amount;
  }
  next();
});

// Generate transaction reference
transactionSchema.pre('save', function(next) {
  if (!this.reference) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.reference = `${this.type.toUpperCase()}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);