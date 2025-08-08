const express = require('express');
const { param, validationResult } = require('express-validator');
const { User, Follow } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/follows/:userId
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId', [
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

    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    // Check if trying to follow self
    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if user to follow exists
    const userToFollow = await User.findByPk(followingId);
    if (!userToFollow || !userToFollow.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      
      res.json({
        message: 'User unfollowed successfully',
        isFollowing: false,
        followStatus: null
      });
    } else {
      // Follow
      const status = userToFollow.isPrivate ? 'pending' : 'accepted';
      
      await Follow.create({
        followerId,
        followingId,
        status
      });

      const message = userToFollow.isPrivate 
        ? 'Follow request sent successfully'
        : 'User followed successfully';

      res.json({
        message,
        isFollowing: status === 'accepted',
        followStatus: status
      });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/requests
// @desc    Get pending follow requests
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Follow.findAll({
      where: {
        followingId: req.user.id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/follows/requests/:requestId
// @desc    Accept or reject follow request
// @access  Private
router.put('/requests/:requestId', [
  param('requestId').isInt().withMessage('Invalid request ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { action } = req.body; // 'accept' or 'reject'
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
    }

    const followRequest = await Follow.findOne({
      where: {
        id: req.params.requestId,
        followingId: req.user.id,
        status: 'pending'
      }
    });

    if (!followRequest) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    if (action === 'accept') {
      await followRequest.update({ status: 'accepted' });
      res.json({ message: 'Follow request accepted' });
    } else {
      await followRequest.destroy();
      res.json({ message: 'Follow request rejected' });
    }
  } catch (error) {
    console.error('Handle follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/:userId/followers
// @desc    Get user's followers
// @access  Private
router.get('/:userId/followers', [
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

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const followers = await Follow.findAndCountAll({
      where: {
        followingId: req.params.userId,
        status: 'accepted'
      },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      followers: followers.rows.map(f => f.follower),
      pagination: {
        total: followers.count,
        page: parseInt(page),
        pages: Math.ceil(followers.count / limit),
        hasMore: followers.count > offset + followers.rows.length
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/:userId/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:userId/following', [
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

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const following = await Follow.findAndCountAll({
      where: {
        followerId: req.params.userId,
        status: 'accepted'
      },
      include: [
        {
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      following: following.rows.map(f => f.following),
      pagination: {
        total: following.count,
        page: parseInt(page),
        pages: Math.ceil(following.count / limit),
        hasMore: following.count > offset + following.rows.length
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
