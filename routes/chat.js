const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getChatMessages,
  sendMessage,
  getAllUserChats,
  markAsRead
} = require('../controllers/chatController');

// @desc    Get chat messages
// @route   GET /api/chat
// @access  Private
router.get('/', auth, getChatMessages);

// @desc    Send message
// @route   POST /api/chat
// @access  Private
router.post('/', auth, sendMessage);

// @desc    Get all user chats (Admin only)
// @route   GET /api/chat/users
// @access  Private (Admin)
router.get('/users', auth, adminAuth, getAllUserChats);

// @desc    Mark messages as read
// @route   PUT /api/chat/read
// @access  Private
router.put('/read', auth, markAsRead);

module.exports = router;