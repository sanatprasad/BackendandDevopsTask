const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user'); // Import User model

const Recommendation = sequelize.define('Recommendation', {
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
    onDelete: 'CASCADE', // Optional: delete recommendations if user is deleted
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, //  Prevent Sequelize from adding createdAt/updatedAt
  tableName: 'Recommendations', // Optional: match your exact table name
});

module.exports = Recommendation;
