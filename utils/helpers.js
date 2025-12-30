const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Calculate investment returns
const calculateInvestmentReturns = (amount, roi, duration, daysElapsed) => {
  const dailyRate = roi / 100 / duration;
  const dailyReturn = amount * dailyRate;
  const totalReturn = dailyReturn * Math.min(daysElapsed, duration);
  const currentValue = amount + totalReturn;
  
  return {
    dailyReturn,
    totalReturn,
    currentValue,
    isCompleted: daysElapsed >= duration
  };
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate transaction reference
const generateTransactionRef = (type) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type.toUpperCase()}-${timestamp}-${random}`;
};

// Calculate pagination
const getPagination = (page, limit) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

// Get date range for analytics
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate: now };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate crypto wallet address (mock)
const generateWalletAddress = (type = 'BTC') => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  
  const length = type === 'BTC' ? 34 : 42;
  const prefix = type === 'BTC' ? '1' : '0x';
  
  for (let i = 0; i < length - prefix.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix + result;
};

// Language translations (basic)
const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    investments: 'Investments',
    transactions: 'Transactions',
    profile: 'Profile',
    settings: 'Settings'
  },
  es: {
    welcome: 'Bienvenido',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    dashboard: 'Panel de control',
    investments: 'Inversiones',
    transactions: 'Transacciones',
    profile: 'Perfil',
    settings: 'Configuración'
  },
  fr: {
    welcome: 'Bienvenue',
    login: 'Connexion',
    register: 'S\'inscrire',
    dashboard: 'Tableau de bord',
    investments: 'Investissements',
    transactions: 'Transactions',
    profile: 'Profil',
    settings: 'Paramètres'
  }
};

// Get translation
const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations.en[key] || key;
};

module.exports = {
  generateToken,
  generateRandomString,
  calculateInvestmentReturns,
  formatCurrency,
  isValidEmail,
  generateTransactionRef,
  getPagination,
  getDateRange,
  sanitizeInput,
  generateWalletAddress,
  getTranslation,
  translations
};