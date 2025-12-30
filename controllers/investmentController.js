const Investment = require('../models/Investment');
const InvestmentPackage = require('../models/InvestmentPackage');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get user investments
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    const investments = await Investment.find(filter)
      .populate('packageId', 'name description roi duration')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Update current values
    for (let investment of investments) {
      await investment.updateCurrentValue();
      await investment.save();
    }

    const total = await Investment.countDocuments(filter);

    res.json({
      success: true,
      count: investments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: investments
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single investment
// @route   GET /api/investments/:id
// @access  Private
const getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('packageId', 'name description roi duration')
      .populate('userId', 'firstName lastName email');

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Update current value
    await investment.updateCurrentValue();
    await investment.save();

    res.json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create investment
// @route   POST /api/investments
// @access  Private
const createInvestment = async (req, res) => {
  try {
    const { packageId, amount } = req.body;

    // Get package details
    const package = await InvestmentPackage.findById(packageId);
    if (!package) {
      return res.status(404).json({ message: 'Investment package not found' });
    }

    if (!package.isActive) {
      return res.status(400).json({ message: 'Investment package is not active' });
    }

    // Validate amount
    if (amount < package.minAmount || amount > package.maxAmount) {
      return res.status(400).json({ 
        message: `Investment amount must be between $${package.minAmount} and $${package.maxAmount}` 
      });
    }

    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (package.duration * 24 * 60 * 60 * 1000));

    // Create investment
    const investment = new Investment({
      userId: req.user.id,
      packageId,
      amount,
      startDate,
      endDate,
      status: 'pending'
    });

    await investment.save();

    // Create investment transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'investment',
      amount,
      status: 'approved',
      method: 'crypto',
      investmentId: investment._id
    });

    await transaction.save();

    // Deduct from user balance
    user.balance -= amount;
    await user.save();

    await investment.populate('packageId', 'name description roi duration');

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get investment statistics
// @route   GET /api/investments/stats
// @access  Private
const getInvestmentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Investment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalCurrentValue: { $sum: '$currentValue' },
          totalReturns: { $sum: '$totalReturns' }
        }
      }
    ]);

    const totalInvestments = await Investment.countDocuments({ userId });
    const totalInvested = await Investment.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalReturns = await Investment.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$totalReturns' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalInvestments,
        totalInvested: totalInvested[0]?.total || 0,
        totalReturns: totalReturns[0]?.total || 0,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Get investment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update investment returns (Admin only)
// @route   PUT /api/investments/:id/returns
// @access  Private/Admin
const updateInvestmentReturns = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.updateCurrentValue();
    await investment.save();

    res.json({
      success: true,
      message: 'Investment returns updated successfully',
      data: investment
    });
  } catch (error) {
    console.error('Update investment returns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInvestments,
  getInvestment,
  createInvestment,
  getInvestmentStats,
  updateInvestmentReturns
};