// models/index.js

const User = require('./user');
const Recommendation = require('./Recommendation');
const Collection = require('./collection');
const CollectionRecommendation = require('./CollectionRecommendation');


// Relationships
CollectionRecommendation.belongsTo(Recommendation, {
  foreignKey: 'recommendation_id',
});
Recommendation.hasMany(CollectionRecommendation, {
  foreignKey: 'recommendation_id',
});

Recommendation.belongsTo(User, {
  foreignKey: 'user_id',
});
User.hasMany(Recommendation, {
  foreignKey: 'user_id',
});

Collection.hasMany(CollectionRecommendation, {
  foreignKey: 'collection_id',
});
CollectionRecommendation.belongsTo(Collection, {
  foreignKey: 'collection_id',
});

module.exports = {
  User,
  Recommendation,
  Collection,
  CollectionRecommendation,
};
