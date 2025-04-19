// routes/collectionRoutes.js

const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// a. Add a recommendation to a collection
router.post('/add-to-collection', collectionController.addToCollection);

// b. Remove a recommendation from a collection
router.delete('/remove-from-collection', collectionController.removeFromCollection);

// c. View all collections with their recommendations for a user
router.get('/user/:userId/collections', collectionController.getUserCollections);

// View recommendations in a collection
router.get('/collection/:collectionId/recommendations', collectionController.getRecommendationsInCollection);

// Get all collections
router.get('/collections', collectionController.getAllCollections);

// Get all recommendations
router.get('/recommendations', collectionController.getAllRecommendations);

// Get all users
router.get('/users', collectionController.getAllUsers);

// Get all collection recommendations
router.get('/collection-recommendations', collectionController.getAllCollectionRecommendations);

// General error handler
// router.use(collectionController.handleError);

module.exports = router;
