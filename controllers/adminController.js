const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const InvestmentPackage = require('../models/InvestmentPackage');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Investment statistics
    const totalInvestments = await Investment.countDocuments();
    const activeInvestments = await Investment.countDocuments({ status: 'active' });
    const totalInvestedAmount = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Transaction statistics
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly growth data
    const monthlyData = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const investmentGrowth = await Investment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          investments: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth
        },
        investments: {
          total: totalInvestments,
          active: activeInvestments,
          totalAmount: totalInvestedAmount[0]?.total || 0
        },
        transactions: {
          pending: pendingTransactions,
          totalDeposits: totalDeposits[0]?.total || 0,
          totalWithdrawals: totalWithdrawals[0]?.total || 0
        },
        growth: {
          monthly: monthlyData,
          investments: investmentGrowth
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all transactions for admin
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const filter = {};

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
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process transaction (approve/reject)
// @route   PATCH /api/admin/transactions/:id/process
// @access  Private/Admin
const processTransaction = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes;
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();

    // Update user balance if approved
    if (status === 'approved') {
      const user = await User.findById(transaction.userId);
      
      if (transaction.type === 'deposit') {
        user.balance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        user.balance -= transaction.amount;
      }
      
      await user.save();
    }

    await transaction.save();

    res.json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: transaction
    });
  } catch (error) {
    console.error('Process transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all investments for admin
// @route   GET /api/admin/investments
// @access  Private/Admin
const getAllInvestments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const investments = await Investment.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('packageId', 'name roi duration')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    console.error('Get all investments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user balance
// @route   PATCH /api/admin/users/:id/balance
// @access  Private/Admin
const updateUserBalance = async (req, res) => {
  try {
    const { amount, type, reason, silent } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldBalance = user.balance;
    
    if (type === 'add') {
      user.balance += amount;
    } else if (type === 'subtract') {
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.balance -= amount;
    }

    await user.save();

    // Create transaction record only if not silent
    if (!silent) {
      const transaction = new Transaction({
        userId: user._id,
        type: type === 'add' ? 'bonus' : 'withdrawal',
        amount,
        status: 'approved',
        method: 'bank_transfer',
        adminNotes: reason || `Balance ${type} by admin`,
        processedBy: req.user.id,
        processedAt: new Date()
      });

      await transaction.save();
    }

    res.json({
      success: true,
      message: `User balance updated successfully`,
      data: {
        user,
        oldBalance,
        newBalance: user.balance,
        silent
      }
    });
  } catch (error) {
    console.error('Update user balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create investment package
// @route   POST /api/admin/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  try {
    const { name, description, minAmount, maxAmount, duration, roi, features, riskLevel } = req.body;

    const package = new InvestmentPackage({
      name,
      description,
      minAmount,
      maxAmount,
      duration,
      roi,
      features: features || ['24/7 Support', 'Automated Trading', 'Daily Reports'],
      riskLevel: riskLevel || 'medium',
      isActive: true,
      createdBy: req.user.id
    });

    await package.save();

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: package
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update investment package
// @route   PUT /api/admin/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    Object.assign(package, req.body);
    await package.save();

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: package
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete investment package
// @route   DELETE /api/admin/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await package.deleteOne();

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle package status
// @route   PATCH /api/admin/packages/:id/toggle
// @access  Private/Admin
const togglePackageStatus = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    package.isActive = !package.isActive;
    await package.save();

    res.json({
      success: true,
      message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`,
      data: package
    });
  } catch (error) {
    console.error('Toggle package status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllTransactions,
  processTransaction,
  getAllInvestments,
  updateUserBalance,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
};