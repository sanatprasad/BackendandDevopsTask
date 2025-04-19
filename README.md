# 📦 Recommendation Collections API

A RESTful API that allows users to manage and organize recommendations (movies, songs, places, etc.) into custom collections.

## 🚀 Features

- Add recommendations to user-defined collections
- Remove recommendations from collections
- View all collections along with their associated recommendations
- Proper error handling for various user scenarios

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (hosted on [neon.tech](https://neon.tech))
- **ORM**: Sequelize
- **DevOps**: Docker, Docker Compose

---

## 🗂️ Database Schema

Tables used:

- `users`
- `recommendations`
- `collections`
- `collection_recommendations` (junction table for many-to-many relationship)

You can import sample CSV data for the first three tables into your Neon database.

---



## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Containerization**: Docker, Docker Compose
- **Environment**: dotenv for configuration
- **Data Formats**: CSV for data import/export

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

