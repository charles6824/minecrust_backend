const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Investment package validation
const validatePackage = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Package name must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('minAmount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  body('maxAmount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  body('roi')
    .isFloat({ min: 0, max: 100 })
    .withMessage('ROI must be between 0 and 100'),
  handleValidationErrors
];

// Investment validation
const validateInvestment = [
  body('packageId')
    .isMongoId()
    .withMessage('Invalid package ID'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('method')
    .isIn(['crypto', 'paypal', 'bank_transfer', 'btc', 'eth', 'trx', 'usdt'])
    .withMessage('Invalid payment method'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Invalid wallet address'),
  body('walletAddress')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Invalid wallet address'),
  handleValidationErrors
];

// User profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('cryptoWallet')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Invalid crypto wallet address'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePackage,
  validateInvestment,
  validateTransaction,
  validateProfileUpdate,
  handleValidationErrors
};