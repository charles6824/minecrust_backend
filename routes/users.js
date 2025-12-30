const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user balance
// @route   GET /api/users/balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      balance: user.balance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search user by wallet ID
// @route   GET /api/users/search/:walletId
// @access  Private
router.get('/search/:walletId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.walletId).select('firstName lastName email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Transfer to another user
// @route   POST /api/users/transfer
// @access  Private
router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientId, amount, note } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Create transactions
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'withdrawal',
      amount,
      status: 'approved',
      method: 'transfer',
      adminNotes: `Transfer to ${recipient.firstName} ${recipient.lastName}${note ? ': ' + note : ''}`,
      processedAt: new Date()
    });

    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'deposit',
      amount,
      status: 'approved',
      method: 'transfer',
      adminNotes: `Transfer from ${sender.firstName} ${sender.lastName}${note ? ': ' + note : ''}`,
      processedAt: new Date()
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        sender: { balance: sender.balance },
        recipient: { balance: recipient.balance },
        amount
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;