# Recommendation API

A robust RESTful API for managing recommendations, collections, and user interactions. Built with Node.js, Express, and PostgreSQL, this API provides a complete solution for creating, organizing, and sharing recommendations.

## 🚀 Features

- **User Management**: Create and manage user profiles with personal information
- **Recommendations**: Post and manage recommendations with categories and captions
- **Collections**: Organize recommendations into custom collections
- **Relationships**: Flexible many-to-many relationships between collections and recommendations
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **PostgreSQL Database**: Robust data storage with Neon PostgreSQL

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Containerization**: Docker, Docker Compose
- **Environment**: dotenv for configuration

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
├── app.js         # Main application file
└── docker-compose.yml
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

