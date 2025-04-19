const { Collection, Recommendation, User, CollectionRecommendation } = require('../models');

// Utility: get offset for pagination
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// a. Add a recommendation to a collection
exports.addToCollection = async (req, res) => {
  const { collectionId, recommendationId, userId } = req.body;

  try {
    const collection = await Collection.findByPk(collectionId);
    const recommendation = await Recommendation.findByPk(recommendationId);

    if (!collection || !recommendation) {
      return res.status(404).send('Collection or Recommendation not found');
    }

    if (recommendation.user_id != userId) {
      return res.status(403).send('You do not have permission to add this recommendation');
    }

    await CollectionRecommendation.create({
      collection_id: collectionId,
      recommendation_id: recommendationId,
    });

    res.send('Recommendation added to collection');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding recommendation to collection');
  }
};

// b. Remove a recommendation from a collection
exports.removeFromCollection = async (req, res) => {
  const { collectionId, recommendationId } = req.body;

  try {
    const deleted = await CollectionRecommendation.destroy({
      where: {
        collection_id: collectionId,
        recommendation_id: recommendationId,
      },
    });

    if (!deleted) {
      return res.status(404).send('Recommendation not found in collection');
    }

    res.send('Recommendation removed from collection');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing recommendation from collection');
  }
};

// c. View all collections with their recommendations for a user
exports.getUserCollections = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const collections = await Collection.findAll({
      where: { user_id: userId },
      include: [
        {
          model: CollectionRecommendation,
          include: [
            {
              model: Recommendation,
              include: [User],
            },
          ],
        },
      ],
      ...pagination,
    });

    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving collections');
  }
};

// View recommendations in a collection
exports.getRecommendationsInCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const recommendations = await CollectionRecommendation.findAll({
      where: { collection_id: collectionId },
      include: [
        {
          model: Recommendation,
          include: [User],
        },
      ],
      ...pagination,
    });

    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recommendations');
  }
};

// Get all collections
exports.getAllCollections = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const collections = await Collection.findAll(pagination);
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving collections');
  }
};

// Get all recommendations
exports.getAllRecommendations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const recommendations = await Recommendation.findAll(pagination);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recommendations');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const users = await User.findAll(pagination);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving users');
  }
};

// Get all collection recommendations
exports.getAllCollectionRecommendations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pagination = getPagination(page, limit);

  try {
    const collectionRecommendations = await CollectionRecommendation.findAll(pagination);
    res.json(collectionRecommendations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving collection recommendations');
  }
};
