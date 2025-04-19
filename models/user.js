const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ✅ Import sequelize instance

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_picture: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'Users',
  timestamps: false,
});

module.exports = User;
