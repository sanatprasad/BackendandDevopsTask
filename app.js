// index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./db');
const { User, Recommendation, Collection, CollectionRecommendation } = require('./models');

const collectionRoutes = require('./routes/collectionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', collectionRoutes);

app.listen(8000, () => {
  console.log('Server running on port 8000');
});


//https://documenter.getpostman.com/view/23481716/2sB2cd5yL4  API Documentation 