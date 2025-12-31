const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get chat messages for user
// @route   GET /api/chat
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.userId : req.user.id;
    
    const messages = await Chat.find({ userId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send chat message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    const chatMessage = new Chat({
      userId: userId || req.user.id,
      message,
      sender: req.user.role === 'admin' ? 'admin' : 'user'
    });

    await chatMessage.save();
    await chatMessage.populate('userId', 'firstName lastName email');

    // Emit to socket if available
    if (req.io) {
      req.io.emit('newMessage', chatMessage);
    }

    res.status(201).json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all user chats (Admin only)
// @route   GET /api/chat/users
// @access  Private (Admin)
const getAllUserChats = async (req, res) => {
  try {
    const chats = await Chat.aggregate([
      {
        $group: {
          _id: '$userId',
          lastMessage: { $last: '$message' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$sender', 'user'] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          user: {
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email'
          },
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Get all user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = req.user.role === 'admin' ? userId : req.user.id;

    await Chat.updateMany(
      { 
        userId: targetUserId,
        sender: req.user.role === 'admin' ? 'user' : 'admin',
        isRead: false 
      },
      { 
        isRead: true,
        readBy: req.user.id,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
  getAllUserChats,
  markAsRead
};