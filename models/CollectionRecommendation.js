const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Collection = require('./collection');
const Recommendation = require('./Recommendation');

const CollectionRecommendation = sequelize.define('CollectionRecommendation', {
  collection_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: Collection,
      key: 'id',
    },
  },
  recommendation_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: Recommendation,
      key: 'id',
    },
  },
});

module.exports = CollectionRecommendation;
