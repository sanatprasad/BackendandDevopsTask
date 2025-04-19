const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with your database URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  },
});

// Connect to the database
const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

// Sync all models with the database (creating tables if not already present)
const syncDb = async () => {
  try {
    await sequelize.sync({ force: false }); // Set to `true` to drop tables and re-create them
    console.log('Database synced successfully.');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

connectDb();
syncDb();

module.exports = sequelize;
