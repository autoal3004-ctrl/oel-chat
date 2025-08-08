const User = require('./User');
const Post = require('./Post');
const Like = require('./Like');
const Comment = require('./Comment');
const Follow = require('./Follow');
const Message = require('./Message');
const Notification = require('./Notification');

// User associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications' });

// Follow associations
User.belongsToMany(User, { 
  through: Follow, 
  as: 'followers', 
  foreignKey: 'followingId',
  otherKey: 'followerId'
});
User.belongsToMany(User, { 
  through: Follow, 
  as: 'following', 
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

// Post associations
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Notification, { foreignKey: 'postId', as: 'notifications' });

// Like associations
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.hasMany(Notification, { foreignKey: 'commentId', as: 'notifications' });

// Follow associations
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Notification.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

module.exports = {
  User,
  Post,
  Like,
  Comment,
  Follow,
  Message,
  Notification
};
