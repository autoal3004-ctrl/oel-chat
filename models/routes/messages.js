const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Message, User } = require('../models');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest message for each conversation
    const conversations = await Message.findAll({
      where: {
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages by conversation partner
    const conversationMap = new Map();

    conversations.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    const formattedConversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/:userId', [
  param('userId').isInt().withMessage('Invalid user ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    // Check if other user exists
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await Message.findAndCountAll({
      where: {
        $or: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ],
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      messages: messages.rows.reverse(), // Reverse to show oldest first
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        profilePicture: otherUser.profilePicture
      },
      pagination: {
        total: messages.count,
        page: parseInt(page),
        pages: Math.ceil(messages.count / limit),
        hasMore: messages.count > offset + messages.rows.length
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:userId
// @desc    Send a message to a user
// @access  Private
router.post('/:userId', [
  param('userId').isInt().withMessage('Invalid user ID'),
  body('content').optional().isLength({ min: 1, max: 1000 }).withMessage('Message content must be 1-1000 characters')
], auth, upload.single('media'), handleMulterError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const receiverId = parseInt(req.params.userId);
    const senderId = req.user.id;
    const { content } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to message self
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    let mediaUrl = null;
    let messageType = 'text';

    if (req.file) {
      mediaUrl = `/uploads/messages/${req.file.filename}`;
      
      if (req.file.mimetype.startsWith('image/')) {
        messageType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        messageType = 'video';
      } else if (req.file.mimetype.startsWith('audio/')) {
        messageType = 'audio';
      } else {
        messageType = 'file';
      }
    }

    // Must have either content or media
    if (!content && !mediaUrl) {
      return res.status(400).json({ message: 'Message must have either text content or media' });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      messageType,
      mediaUrl
    });

    const newMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error during message sending' });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', [
  param('messageId').isInt().withMessage('Invalid message ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await message.update({
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error during message deletion' });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', [
  param('messageId').isInt().withMessage('Invalid message ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the receiver
    if (message.receiverId !== userId) {
      return res.status(403).json({ message: 'You can only mark messages sent to you as read' });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
