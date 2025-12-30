const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     InvestmentPackage:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - minAmount
 *         - maxAmount
 *         - duration
 *         - roi
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated package ID
 *         name:
 *           type: string
 *           description: Package name
 *         description:
 *           type: string
 *           description: Package description
 *         minAmount:
 *           type: number
 *           description: Minimum investment amount
 *         maxAmount:
 *           type: number
 *           description: Maximum investment amount
 *         duration:
 *           type: number
 *           description: Investment duration in days
 *         roi:
 *           type: number
 *           description: Return on investment percentage
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdBy:
 *           type: string
 *           description: Admin user ID who created the package
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  minAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  roi: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  features: [{
    type: String,
    trim: true
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Validate that maxAmount is greater than minAmount
packageSchema.pre('save', function(next) {
  if (this.maxAmount <= this.minAmount) {
    return next(new Error('Maximum amount must be greater than minimum amount'));
  }
  next();
});

module.exports = mongoose.model('InvestmentPackage', packageSchema);