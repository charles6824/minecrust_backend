const Settings = require('../models/Settings');

// @desc    Get payment addresses
// @route   GET /api/settings/payment-addresses
// @access  Public
const getPaymentAddresses = async (req, res) => {
  try {
    const addresses = await Settings.find({
      key: { $in: ['tether_address', 'solana_address', 'trx_address'] }
    });

    const paymentConfig = {
      tether: addresses.find(a => a.key === 'tether_address')?.value || '',
      solana: addresses.find(a => a.key === 'solana_address')?.value || '',
      trx: addresses.find(a => a.key === 'trx_address')?.value || ''
    };

    res.json(paymentConfig);
  } catch (error) {
    console.error('Get payment addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update payment addresses
// @route   PUT /api/admin/payment-config
// @access  Private/Admin
const updatePaymentConfig = async (req, res) => {
  try {
    const { tether, solana, trx } = req.body;

    const updates = [
      { key: 'tether_address', value: tether },
      { key: 'solana_address', value: solana },
      { key: 'trx_address', value: trx }
    ];

    for (const update of updates) {
      await Settings.findOneAndUpdate(
        { key: update.key },
        { 
          key: update.key,
          value: update.value,
          category: 'payment',
          description: `${update.key.split('_')[0].toUpperCase()} payment address`,
          isPublic: true,
          dataType: 'string'
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Payment configuration updated successfully'
    });
  } catch (error) {
    console.error('Update payment config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentAddresses,
  updatePaymentConfig
};