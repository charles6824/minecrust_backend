const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');

// Generate JWT token
const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = generateAuthToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        balance: user.balance,
        hasCompletedSetup: user.hasCompletedSetup,
        isActive: user.isActive,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateAuthToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        balance: user.balance,
        cryptoWallet: user.cryptoWallet,
        hasCompletedSetup: user.hasCompletedSetup,
        isActive: user.isActive,
        joinDate: user.createdAt,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        walletType: user.walletType,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        walletId: user.walletId,
        gender: user.gender,
        withdrawalAddresses: user.withdrawalAddresses
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        balance: user.balance,
        cryptoWallet: user.cryptoWallet,
        hasCompletedSetup: user.hasCompletedSetup,
        isActive: user.isActive,
        joinDate: user.createdAt,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        walletType: user.walletType,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        walletId: user.walletId,
        gender: user.gender,
        withdrawalAddresses: user.withdrawalAddresses
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'city', 
      'country', 'cryptoWallet', 'walletType', 'emergencyContact', 
      'emergencyPhone', 'hasCompletedSetup', 'gender', 'withdrawalAddresses'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        balance: user.balance,
        cryptoWallet: user.cryptoWallet,
        hasCompletedSetup: user.hasCompletedSetup,
        isActive: user.isActive,
        joinDate: user.createdAt,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        walletType: user.walletType,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        walletId: user.walletId,
        gender: user.gender,
        withdrawalAddresses: user.withdrawalAddresses
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};