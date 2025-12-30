const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated settings ID
 *         key:
 *           type: string
 *           description: Setting key
 *         value:
 *           type: string
 *           description: Setting value
 *         category:
 *           type: string
 *           enum: [general, security, payment, notification]
 *         description:
 *           type: string
 *           description: Setting description
 *         isPublic:
 *           type: boolean
 *           description: Whether setting is publicly accessible
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'security', 'payment', 'notification', 'language'],
    default: 'general'
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get setting by key
settingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

// Static method to set setting
settingsSchema.statics.setSetting = async function(key, value, updatedBy = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    { value, updatedBy },
    { upsert: true, new: true }
  );
  return setting;
};

module.exports = mongoose.model('Settings', settingsSchema);