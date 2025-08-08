const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Comment, Post, User } = require('../models');
const auth = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId', [
  param('postId').isInt().withMessage('Invalid post ID'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters'),
  body('parentId').optional().isInt().withMessage('Invalid parent comment ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const postId = parseInt(req.params.postId);
    const { content, parentId } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'user', attributes: ['id'] }]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If parentId is provided, check if parent comment exists
    let parentComment = null;
    if (parentId) {
      parentComment = await Comment.findOne({
        where: { id: parentId, postId },
        include: [{ model: User, as: 'user', attributes: ['id'] }]
      });
      
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    // Create comment
    const comment = await Comment.create({
      userId,
      postId,
      content,
      parentId: parentId || null
    });

    // Increment comments count on post
    await post.increment('commentsCount');

    // Create notification for post owner (if not commenting on own post)
    if (post.user.id !== userId) {
      await createNotification(
        post.user.id,
        userId,
        'comment',
        `${req.user.username} commented on your post`,
        postId,
        comment.id
      );
    }

    // Create notification for parent comment owner (if replying)
    if (parentComment && parentComment.user.id !== userId && parentComment.user.id !== post.user.id) {
      await createNotification(
        parentComment.user.id,
        userId,
        'comment',
        `${req.user.username} replied to your comment`,
        postId,
        comment.id
      );
    }

    // Fetch the created comment with user info
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment creation' });
  }
});

// @route   GET /api/comments/:postId
// @desc    Get comments for a post
// @access  Private
router.get('/:postId', [
  param('postId').isInt().withMessage('Invalid post ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const postId = parseInt(req.params.postId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get top-level comments
    const comments = await Comment.findAndCountAll({
      where: {
        postId,
        parentId: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
            }
          ],
          limit: 3, // Limit initial replies shown
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comments: comments.rows,
      pagination: {
        total: comments.count,
        page: parseInt(page),
        pages: Math.ceil(comments.count / limit),
        hasMore: comments.count > offset + comments.rows.length
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/:commentId/replies
// @desc    Get replies for a comment
// @access  Private
router.get('/:commentId/replies', [
  param('commentId').isInt().withMessage('Invalid comment ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const commentId = parseInt(req.params.commentId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if parent comment exists
    const parentComment = await Comment.findByPk(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const replies = await Comment.findAndCountAll({
      where: {
        parentId: commentId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      replies: replies.rows,
      pagination: {
        total: replies.count,
        page: parseInt(page),
        pages: Math.ceil(replies.count / limit),
        hasMore: replies.count > offset + replies.rows.length
      }
    });
  } catch (error) {
    console.error('Get comment replies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid comment ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const commentId = parseInt(req.params.id);
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    // Get the post to decrement comments count
    const post = await Post.findByPk(comment.postId);

    // Delete the comment and all its replies
    await Comment.destroy({
      where: {
        $or: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    // Decrement comments count (including replies)
    const deletedCommentsCount = await Comment.count({
      where: {
        $or: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    if (post) {
      await post.decrement('commentsCount', { by: deletedCommentsCount + 1 });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error during comment deletion' });
  }
});

module.exports = router;
