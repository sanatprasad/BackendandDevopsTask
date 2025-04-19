const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',  // Optional: delete collections when user is deleted
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, 
  tableName: 'Collections', // Optional: specify table name explicitly
});

module.exports = Collection;
