const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Investment:
 *       type: object
 *       required:
 *         - userId
 *         - packageId
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated investment ID
 *         userId:
 *           type: string
 *           description: User ID who made the investment
 *         packageId:
 *           type: string
 *           description: Investment package ID
 *         amount:
 *           type: number
 *           description: Investment amount
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         currentValue:
 *           type: number
 *           description: Current investment value
 *         dailyReturn:
 *           type: number
 *           description: Daily return amount
 *         status:
 *           type: string
 *           enum: [active, completed, pending, cancelled]
 *         totalReturns:
 *           type: number
 *           description: Total returns earned
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPackage',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  currentValue: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  dailyReturn: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'pending', 'cancelled'],
    default: 'pending'
  },
  totalReturns: {
    type: Number,
    default: 0
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate daily return based on package ROI
investmentSchema.methods.calculateDailyReturn = async function() {
  await this.populate('packageId');
  if (this.packageId && this.status === 'active') {
    const dailyRate = this.packageId.roi / 100 / this.packageId.duration;
    this.dailyReturn = this.amount * dailyRate;
    return this.dailyReturn;
  }
  return 0;
};

// Update current value based on days elapsed
investmentSchema.methods.updateCurrentValue = async function() {
  if (this.status !== 'active') return this.currentValue;
  
  const now = new Date();
  const daysElapsed = Math.floor((now - this.startDate) / (1000 * 60 * 60 * 24));
  
  await this.calculateDailyReturn();
  const totalReturn = this.dailyReturn * daysElapsed;
  this.currentValue = this.amount + totalReturn;
  this.totalReturns = totalReturn;
  this.lastCalculated = now;
  
  // Check if investment is completed
  if (now >= this.endDate) {
    this.status = 'completed';
  }
  
  return this.currentValue;
};

module.exports = mongoose.model('Investment', investmentSchema);