# Recommendation API Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Setup Instructions](#setup-instructions)
3. [Running the Application](#running-the-application)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Data Management](#data-management)
6. [API Testing](#api-testing)
7. [System Design](#system-design)

## System Overview

The Recommendation API is a robust system that allows users to create, manage, and share recommendations organized in collections. The system consists of:

- **Backend**: Node.js/Express API
- **Database**: PostgreSQL
- **Infrastructure**: AWS (EC2, RDS, ALB, Auto Scaling)
- **Containerization**: Docker
- **Infrastructure as Code**: Terraform

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- AWS CLI
- Terraform (v1.5.7 or higher)
- PostgreSQL client

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd recommendation-api
   ```

2. Create environment files:
   ```bash
   # .env file
   DATABASE_URL=postgresql://postgres:postgres@db:5432/recommendation_db
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_DEFAULT_REGION=us-east-1
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Local Development

1. Start the application with Docker:
   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:8000`

### Infrastructure Deployment

1. Initialize Terraform:
   ```bash
   cd terraform
   terraform init
   ```

2. Review the deployment plan:
   ```bash
   terraform plan
   ```

3. Apply the infrastructure:
   ```bash
   terraform apply
   ```

4. Verify deployment:
   ```bash
   # Check EC2 instances
   aws ec2 describe-instances

   # Check RDS instance
   aws rds describe-db-instances

   # Check ALB
   aws elbv2 describe-load-balancers
   ```

## Data Management

### Database Setup and Connection

1. Connect to PostgreSQL:
```bash
psql -h localhost -U postgres -d recommendation_db
```

2. Create database and tables:
```sql
CREATE DATABASE recommendation_db;
\c recommendation_db

CREATE TABLE Users (
    id BIGINT PRIMARY KEY,
    fname VARCHAR(255) NOT NULL,
    sname VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE Recommendations (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE Collections (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE CollectionRecommendations (
    collection_id BIGINT REFERENCES Collections(id),
    recommendation_id BIGINT REFERENCES Recommendations(id),
    PRIMARY KEY (collection_id, recommendation_id)
);
```

### Sample Data Import

1. Import users from CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Users(id, fname, sname, profile_picture, bio, created_at) FROM 'users.csv' WITH (FORMAT csv, HEADER true)"
```

2. Import recommendations from CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Recommendations(id, user_id, title, caption, category, created_at) FROM 'recommendations.csv' WITH (FORMAT csv, HEADER true)"
```

3. Import collections from CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Collections(id, user_id, title, created_at) FROM 'collections.csv' WITH (FORMAT csv, HEADER true)"
```

### Data Export

1. Export users to CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Users TO 'users.csv' WITH (FORMAT csv, HEADER true)"
```

2. Export recommendations to CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Recommendations TO 'recommendations.csv' WITH (FORMAT csv, HEADER true)"
```

3. Export collections to CSV:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy Collections TO 'collections.csv' WITH (FORMAT csv, HEADER true)"
```

4. Export collection-recommendation relationships:
```bash
psql -h localhost -U postgres -d recommendation_db -c "\copy CollectionRecommendations TO 'collection_recommendations.csv' WITH (FORMAT csv, HEADER true)"
```

### Database Maintenance

1. Check table sizes:
```sql
SELECT pg_size_pretty(pg_total_relation_size('Users'));
SELECT pg_size_pretty(pg_total_relation_size('Recommendations'));
SELECT pg_size_pretty(pg_total_relation_size('Collections'));
```

2. Vacuum analyze tables:
```sql
VACUUM ANALYZE Users;
VACUUM ANALYZE Recommendations;
VACUUM ANALYZE Collections;
VACUUM ANALYZE CollectionRecommendations;
```

3. Check index usage:
```sql
SELECT schemaname, relname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes;
```

## API Testing

### Endpoint Testing

1. Health Check:
   ```bash
   curl http://localhost:8000/health
   ```

2. User Management:
   ```bash
   # Create user
   curl -X POST http://localhost:8000/api/users \
     -H "Content-Type: application/json" \
     -d '{"fname":"John","sname":"Doe"}'

   # Get user
   curl http://localhost:8000/api/users/1
   ```

3. Recommendations:
   ```bash
   # Create recommendation
   curl -X POST http://localhost:8000/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{"title":"Great Book","category":"Books"}'

   # Get recommendations
   curl http://localhost:8000/api/recommendations
   ```

4. Collections:
   ```bash
   # Create collection
   curl -X POST http://localhost:8000/api/collections \
     -H "Content-Type: application/json" \
     -d '{"title":"My Favorites"}'

   # Add recommendation to collection
   curl -X POST http://localhost:8000/api/collections/1/recommendations/1
   ```

## API Endpoints Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

### Endpoints

#### 1. Collection Management

##### Add Recommendation to Collection
```http
POST /add-to-collection
```
**Request Body:**
```json
{
  "collectionId": "number",
  "recommendationId": "number",
  "userId": "number"
}
```
**Response:**
- Success: `200 OK` with message "Recommendation added to collection"
- Error: `404 Not Found` if collection or recommendation not found
- Error: `403 Forbidden` if user doesn't own the recommendation
- Error: `500 Internal Server Error` for other errors

##### Remove Recommendation from Collection
```http
DELETE /remove-from-collection
```
**Request Body:**
```json
{
  "collectionId": "number",
  "recommendationId": "number"
}
```
**Response:**
- Success: `200 OK` with message "Recommendation removed from collection"
- Error: `404 Not Found` if recommendation not found in collection
- Error: `500 Internal Server Error` for other errors

##### Get User Collections
```http
GET /user/:userId/collections
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "number",
    "user_id": "number",
    "title": "string",
    "created_at": "timestamp",
    "CollectionRecommendations": [
      {
        "Recommendation": {
          "id": "number",
          "user_id": "number",
          "title": "string",
          "caption": "string",
          "category": "string",
          "created_at": "timestamp",
          "User": {
            "id": "number",
            "fname": "string",
            "sname": "string"
          }
        }
      }
    ]
  }
]
```

##### Get Recommendations in Collection
```http
GET /collection/:collectionId/recommendations
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "collection_id": "number",
    "recommendation_id": "number",
    "Recommendation": {
      "id": "number",
      "user_id": "number",
      "title": "string",
      "caption": "string",
      "category": "string",
      "created_at": "timestamp",
      "User": {
        "id": "number",
        "fname": "string",
        "sname": "string"
      }
    }
  }
]
```

#### 2. Data Retrieval

##### Get All Collections
```http
GET /collections
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "number",
    "user_id": "number",
    "title": "string",
    "created_at": "timestamp"
  }
]
```

##### Get All Recommendations
```http
GET /recommendations
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "number",
    "user_id": "number",
    "title": "string",
    "caption": "string",
    "category": "string",
    "created_at": "timestamp"
  }
]
```

##### Get All Users
```http
GET /users
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "number",
    "fname": "string",
    "sname": "string",
    "profile_picture": "string",
    "bio": "string",
    "created_at": "timestamp"
  }
]
```

##### Get All Collection Recommendations
```http
GET /collection-recommendations
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "collection_id": "number",
    "recommendation_id": "number"
  }
]
```

### Error Responses

All endpoints may return the following error responses:

1. **400 Bad Request**
   - Invalid request parameters
   - Missing required fields

2. **404 Not Found**
   - Resource not found
   - Invalid IDs

3. **500 Internal Server Error**
   - Server-side errors
   - Database errors

### Pagination

All list endpoints support pagination through query parameters:
- `page`: The page number to retrieve (1-based)
- `limit`: Number of items per page

Example:
```
GET /collections?page=2&limit=20
```

## System Design

### Architecture Decisions

1. **Microservices vs Monolith**:
   - Chose monolithic architecture for simplicity
   - Future-proofed with modular design for potential microservices split

2. **Database Choice**:
   - PostgreSQL for relational data
   - Support for complex queries and relationships
   - ACID compliance for data integrity

3. **Infrastructure Design**:
   - Multi-AZ deployment for high availability
   - Auto-scaling for performance
   - Load balancing for traffic distribution

4. **Security Considerations**:
   - Private subnets for database
   - Security groups for network isolation
   - Environment variables for sensitive data

### Scaling Strategy

1. **Horizontal Scaling**:
   - Auto-scaling group for EC2 instances
   - Load balancer for traffic distribution
   - Database read replicas (future)

2. **Vertical Scaling**:
   - RDS instance size adjustments
   - EC2 instance type upgrades

### Monitoring and Logging

1. **CloudWatch Integration**:
   - CPU utilization monitoring
   - Auto-scaling triggers
   - Custom metrics (future)

2. **Logging Strategy**:
   - Application logs to CloudWatch
   - Database logs to RDS
   - Access logs to ALB

### Backup and Recovery

1. **Database Backups**:
   - Automated daily backups
   - 7-day retention period
   - Point-in-time recovery

2. **Infrastructure Recovery**:
   - Terraform state management
   - Infrastructure as code for quick recovery
   - Multi-AZ deployment for redundancy

## Troubleshooting

### Common Issues

1. **Database Connection**:
   ```bash
   # Check database connection
   psql -h localhost -U postgres -d recommendation_db
   ```

2. **Application Logs**:
   ```bash
   # View application logs
   docker-compose logs app
   ```

3. **Infrastructure Status**:
   ```bash
   # Check Terraform state
   terraform show

   # Check AWS resources
   aws cloudformation describe-stack-resources --stack-name recommendation-api
   ```

### Performance Optimization

1. **Database Optimization**:
   - Index frequently queried columns
   - Regular VACUUM operations
   - Query optimization

2. **Application Optimization**:
   - Connection pooling
   - Caching implementation
   - Async operations

## Future Enhancements

1. **Planned Features**:
   - User authentication
   - API rate limiting
   - Caching layer
   - Search functionality

2. **Infrastructure Improvements**:
   - Multi-region deployment
   - CDN integration
   - WAF implementation

