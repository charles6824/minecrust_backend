const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user.id };
    
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create deposit transaction
// @route   POST /api/transactions/deposit
// @access  Private
const createDeposit = async (req, res) => {
  try {
    const { amount, method, reference, walletAddress } = req.body;

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'deposit',
      amount,
      method,
      reference,
      walletAddress,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted successfully. Please wait for admin approval.',
      data: transaction
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createWithdrawal = async (req, res) => {
  try {
    const { amount, method, address, walletAddress } = req.body;
    const finalAddress = address || walletAddress;

    if (!finalAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Calculate fee (example: 2% withdrawal fee)
    const feePercentage = 0.02;
    const fee = amount * feePercentage;
    const netAmount = amount - fee;

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'withdrawal',
      amount,
      method,
      walletAddress: finalAddress,
      fee,
      netAmount,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. Please wait for admin approval.',
      data: transaction
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalDeposits = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type: 'deposit', 
          status: 'approved' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawals = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type: 'withdrawal', 
          status: 'approved' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        byTypeAndStatus: stats
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createDeposit,
  createWithdrawal,
  getTransactionStats
};