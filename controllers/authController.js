const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendEmail } = require('../services/emailService');
const { generateToken } = require('../utils/helpers');
const crypto = require('crypto');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP
    await OTP.findOneAndDelete({ email }); // Remove any existing OTP
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send OTP email
    await sendEmail(email, 'otp', firstName, otp);

    // Store user data temporarily
    const tempUserData = {
      email,
      password,
      firstName,
      lastName,
      timestamp: Date.now()
    };

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      tempToken: jwt.sign(tempUserData, process.env.JWT_SECRET, { expiresIn: '15m' })
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const { email, password, firstName, lastName } = decoded;

    // Verify OTP
    const otpDoc = await OTP.findOne({ email, otp, verified: false });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      isVerified: true
    });

    await user.save();
    
    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Send welcome emails
    await sendEmail(email, 'registration', firstName);
    await sendEmail(process.env.ADMIN_EMAIL, 'adminNotification', 'Registration', email, `${firstName} ${lastName}`);

    // Generate JWT
    const token = generateAuthToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletId: user.walletId,
        balance: user.balance,
        isVerified: user.isVerified,
        hasCompletedSetup: user.hasCompletedSetup,
        isActive: user.isActive,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
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
  verifyOTP,
  login,
  getMe,
  updateProfile,
  changePassword
};