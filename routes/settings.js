const express = require('express');
const router = express.Router();
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const Settings = require('../models/Settings');
const { getPaymentAddresses } = require('../controllers/paymentConfigController');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings and configuration
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get public settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Settings'
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const settings = await Settings.find({ isPublic: true });
    
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/settings/language:
 *   get:
 *     summary: Get supported languages
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Supported languages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       flag:
 *                         type: string
 */
router.get('/language', async (req, res) => {
  try {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ];

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/payment-addresses', getPaymentAddresses);

/**
 * @swagger
 * /api/settings/admin:
 *   get:
 *     summary: Get all settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const settings = await Settings.find().populate('updatedBy', 'firstName lastName');
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create or update setting (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [general, security, payment, notification, language]
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               dataType:
 *                 type: string
 *                 enum: [string, number, boolean, object, array]
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       201:
 *         description: Setting created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { key, value, category, description, isPublic, dataType } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value,
        category,
        description,
        isPublic,
        dataType,
        updatedBy: req.user.id
      },
      { upsert: true, new: true }
    ).populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     summary: Delete setting (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *       404:
 *         description: Setting not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/:key', auth, adminAuth, async (req, res) => {
  try {
    const setting = await Settings.findOneAndDelete({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;