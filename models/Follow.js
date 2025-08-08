const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted'),
    defaultValue: 'accepted'
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    },
    {
      fields: ['followerId']
    },
    {
      fields: ['followingId']
    }
  ],
  validate: {
    notSelfFollow() {
      if (this.followerId === this.followingId) {
        throw new Error('Users cannot follow themselves');
      }
    }
  }
});

module.exports = Follow;
