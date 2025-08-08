const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { User, Post, Follow } = require('../models');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Private
router.get('/profile/:username', [
  param('username').isAlphanumeric().withMessage('Invalid username format')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username } = req.params;
    
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'mediaUrl', 'mediaType', 'likesCount', 'commentsCount', 'createdAt'],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user follows this user
    const isFollowing = await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: user.id
      }
    });

    // Get followers and following counts
    const followersCount = await Follow.count({
      where: { followingId: user.id, status: 'accepted' }
    });

    const followingCount = await Follow.count({
      where: { followerId: user.id, status: 'accepted' }
    });

    const postsCount = user.posts.length;

    res.json({
      user: {
        ...user.toJSON(),
        followersCount,
        followingCount,
        postsCount,
        isFollowing: !!isFollowing,
        followStatus: isFollowing?.status || null
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('firstName').optional().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').optional().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('isPrivate').optional().isBoolean().withMessage('Privacy setting must be a boolean')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'bio', 'website', 'phone', 'isPrivate'];
    const updates = {};

    // Only include allowed fields that are present in request
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', auth, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicture = `/uploads/profiles/${req.file.filename}`;
    
    await req.user.update({ profilePicture });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   GET /api/users/search
// @desc    Search users by username or name
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const offset = (page - 1) * limit;
    
    const users = await User.findAndCountAll({
      where: {
        $or: [
          { username: { $like: `%${q}%` } },
          { firstName: { $like: `%${q}%` } },
          { lastName: { $like: `%${q}%` } }
        ],
        isActive: true,
        id: { $ne: req.user.id } // Exclude current user
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['username', 'ASC']]
    });

    res.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        pages: Math.ceil(users.count / limit),
        hasMore: users.count > offset + users.rows.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// @route   GET /api/users/suggested
// @desc    Get suggested users to follow
// @access  Private
router.get('/suggested', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get users that current user is not following
    const followingIds = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId']
    }).then(follows => follows.map(f => f.followingId));

    followingIds.push(req.user.id); // Exclude self

    const suggestedUsers = await User.findAll({
      where: {
        id: { $notIn: followingIds },
        isActive: true
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
      limit: limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({ users: suggestedUsers });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
