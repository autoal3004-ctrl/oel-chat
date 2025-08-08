const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Post, User, Like, Comment } = require('../models');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.single('media'), handleMulterError, [
  body('caption').optional().isLength({ max: 2200 }).withMessage('Caption cannot exceed 2200 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { caption, location } = req.body;
    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = `/uploads/posts/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    if (!caption && !mediaUrl) {
      return res.status(400).json({ message: 'Post must have either caption or media' });
    }

    const post = await Post.create({
      userId: req.user.id,
      caption,
      mediaUrl,
      mediaType,
      location
    });

    const newPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error during post creation' });
  }
});

// @route   GET /api/posts/feed
// @desc    Get posts feed for current user
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Like,
          as: 'likes',
          required: false,
          where: { userId: req.user.id },
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format posts with like status
    const formattedPosts = posts.rows.map(post => ({
      ...post.toJSON(),
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined // Remove likes array from response
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        total: posts.count,
        page: parseInt(page),
        pages: Math.ceil(posts.count / limit),
        hasMore: posts.count > offset + posts.rows.length
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Private
router.get('/:id', [
  param('id').isInt().withMessage('Invalid post ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Like,
          as: 'likes',
          required: false,
          where: { userId: req.user.id },
          attributes: ['id']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture', 'isVerified']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 5
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const formattedPost = {
      ...post.toJSON(),
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined
    };

    res.json({ post: formattedPost });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', [
  param('id').isInt().withMessage('Invalid post ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
      where: { userId, postId }
    });

    if (existingLike) {
      // Unlike the post
      await existingLike.destroy();
      await post.decrement('likesCount');
      
      res.json({
        message: 'Post unliked successfully',
        isLiked: false,
        likesCount: post.likesCount - 1
      });
    } else {
      // Like the post
      await Like.create({ userId, postId });
      await post.increment('likesCount');
      
      res.json({
        message: 'Post liked successfully',
        isLiked: true,
        likesCount: post.likesCount + 1
      });
    }
  } catch (error) {
    console.error('Like/unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid post ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if current user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own posts.' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error during post deletion' });
  }
});

module.exports = router;
