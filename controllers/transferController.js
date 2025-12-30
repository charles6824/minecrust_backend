const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Transfer funds to another user
// @route   POST /api/transfers
// @access  Private
const transferFunds = async (req, res) => {
  try {
    const { recipientWalletId, amount, description } = req.body;
    const senderId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    // Find sender
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Find recipient by wallet ID
    const recipient = await User.findOne({ walletId: recipientWalletId });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient wallet ID not found' });
    }

    // Prevent self-transfer
    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Perform transfer
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Create transaction records
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'transfer_out',
      amount: amount,
      status: 'approved',
      method: 'internal',
      description: `Transfer to ${recipient.firstName} ${recipient.lastName} (${recipientWalletId})`,
      processedAt: new Date()
    });

    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'transfer_in',
      amount: amount,
      status: 'approved',
      method: 'internal',
      description: `Transfer from ${sender.firstName} ${sender.lastName} (${sender.walletId})`,
      processedAt: new Date()
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        amount,
        recipient: {
          name: `${recipient.firstName} ${recipient.lastName}`,
          walletId: recipient.walletId
        },
        newBalance: sender.balance,
        transactionId: senderTransaction._id
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error during transfer' });
  }
};

// @desc    Search user by wallet ID
// @route   GET /api/transfers/search/:walletId
// @access  Private
const searchUserByWalletId = async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const user = await User.findOne({ walletId }).select('firstName lastName walletId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow searching for self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    res.json({
      success: true,
      data: {
        name: `${user.firstName} ${user.lastName}`,
        walletId: user.walletId
      }
    });

  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  transferFunds,
  searchUserByWalletId
};