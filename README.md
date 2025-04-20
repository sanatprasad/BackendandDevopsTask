# 📦 Recommendation Collections API

A RESTful API that allows users to manage and organize recommendations (movies, songs, places, etc.) into custom collections.

## 🚀 Features

- **User Management**: Create and manage user profiles with personal information
- **Recommendations**: Post and manage recommendations with categories and captions
- **Collections**: Organize recommendations into custom collections
- **Relationships**: Flexible many-to-many relationships between collections and recommendations
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **PostgreSQL Database**: Robust data storage with Neon PostgreSQL
- **CSV Data Support**: Import/Export functionality for users, recommendations, and collections

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Containerization**: Docker, Docker Compose
- **Environment**: dotenv for configuration
- **Data Formats**: CSV for data import/export

## 📦 Project Structure

```
recommendation-api/
├── controllers/     # Business logic handlers
├── models/         # Database models
│   ├── user.js
│   ├── Recommendation.js
│   ├── collection.js
│   └── CollectionRecommendation.js
├── routes/         # API routes
├── db/            # Database configuration
├── data/          # CSV data files
│   ├── users.csv
│   ├── recommendations.csv
│   └── collections.csv
├── app.js         # Main application file
├── Dockerfile     # Docker configuration
├── docker-compose.yml
└── .env          # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd recommendation-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with your database configuration:
   ```
   DATABASE_URL=postgresql://your-database-url
   ```

### Running with Docker

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:8000`

### Running Locally

1. Start the server:
   ```bash
   node app.js
   ```

2. The API will be available at `http://localhost:8000`

## 📚 API Documentation

For detailed API documentation, visit: [API Documentation](https://documenter.getpostman.com/view/23481716/2sB2cd5yL4)

## 🗄️ Database Schema

### Users
- id (BIGINT, Primary Key)
- fname (STRING)
- sname (STRING)
- profile_picture (STRING)
- bio (TEXT)
- created_at (DATE)

### Recommendations
- id (BIGINT, Primary Key)
- user_id (BIGINT, Foreign Key)
- title (STRING)
- caption (TEXT)
- category (STRING)
- created_at (DATE)

### Collections
- id (BIGINT, Primary Key)
- user_id (BIGINT, Foreign Key)
- title (STRING)
- created_at (DATE)

### CollectionRecommendations
- collection_id (BIGINT, Primary Key, Foreign Key)
- recommendation_id (BIGINT, Primary Key, Foreign Key)

## 📊 Data Management

The project includes CSV files for initial data:
- `users.csv`: User data
- `recommendations.csv`: Recommendation data
- `collections.csv`: Collection data

These files can be used for:
- Initial data seeding
- Data migration
- Backup and restore operations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

