# Recommendation API Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Setup Instructions](#setup-instructions)
3. [Running the Application](#running-the-application)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Data Management](#data-management)
6. [API Testing](#api-testing)
7. [System Design](#system-design)
8. [Dockerization](#dockerization)
9. [Sequelize ORM Implementation](#sequelize-orm-implementation)

## System Overview

The Recommendation API is a robust system that allows users to create, manage, and share recommendations organized in collections. The system consists of:

- **Backend**: Node.js/Express API
- **Database**: PostgreSQL
- **Infrastructure**: AWS (EC2, RDS, ALB, Auto Scaling)
- **Containerization**: Docker
- **Infrastructure as Code**: Terraform

## Setup and Running Instructions

### Prerequisites

1. **Development Environment**:
   - Node.js (v18 or higher)
   - npm (v8 or higher)
   - Git
   - PostgreSQL client (psql)

2. **Infrastructure Tools**:
   - AWS CLI (v2)
   - Terraform (v1.5.7 or higher)
   - Docker and Docker Compose

3. **AWS Requirements**:
   - AWS account with appropriate permissions
   - AWS CLI configured with credentials
   - IAM user with EC2, RDS, VPC, and ALB permissions

### Backend Setup

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd recommendation-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   # Create .env file
   cat > .env << EOL
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recommendation_db
   PORT=3000
   NODE_ENV=development
   EOL
   ```

4. **Database Setup**:
   ```bash
   # Create database
   createdb recommendation_db

   # Connect to database
   psql -d recommendation_db

   # Run migrations
   npm run migrate
   ```

5. **Start Development Server**:
   ```bash
   # Start server with hot reload
   npm run dev
   ```

### Infrastructure Setup

1. **Terraform Configuration**:
   ```bash
   cd terraform

   # Create terraform.tfvars
   cat > terraform.tfvars << EOL
   vpc_cidr_block = "10.0.0.0/16"
   public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
   private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
   instance_type = "t2.micro"
   db_username = "postgres"
   db_password = "your_secure_password"
   EOL
   ```

2. **Initialize Terraform**:
   ```bash
   terraform init
   ```

3. **Review Infrastructure Plan**:
   ```bash
   terraform plan
   ```

4. **Apply Infrastructure**:
   ```bash
   terraform apply
   ```

### Running in Production

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Database Migration**:
   ```bash
   # Connect to RDS
   psql -h <rds-endpoint> -U postgres -d recommendation_db

   # Run migrations
   npm run migrate:prod
   ```

3. **Start Production Server**:
   ```bash
   npm start
   ```

### Infrastructure Management

1. **Scaling Operations**:
   ```bash
   # Check current instances
   aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names api-asg

   # Update desired capacity
   aws autoscaling set-desired-capacity --auto-scaling-group-name api-asg --desired-capacity 3
   ```

2. **Database Operations**:
   ```bash
   # Check RDS status
   aws rds describe-db-instances --db-instance-identifier recommendation-db

   # Create snapshot
   aws rds create-db-snapshot --db-instance-identifier recommendation-db --db-snapshot-identifier backup-$(date +%Y%m%d)
   ```

3. **Load Balancer Operations**:
   ```bash
   # Check ALB status
   aws elbv2 describe-load-balancers --names recommendation-lb

   # Check target health
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

### Monitoring and Logging

1. **Application Logs**:
   ```bash
   # View CloudWatch logs
   aws logs get-log-events --log-group-name /recommendation-api/app --log-stream-name <stream-name>
   ```

2. **Infrastructure Monitoring**:
   ```bash
   # Check CloudWatch metrics
   aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=AutoScalingGroupName,Value=api-asg
   ```

3. **Database Monitoring**:
   ```bash
   # Check RDS metrics
   aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name CPUUtilization --dimensions Name=DBInstanceIdentifier,Value=recommendation-db
   ```

### Troubleshooting

1. **Application Issues**:
   ```bash
   # Check application logs
   aws logs get-log-events --log-group-name /recommendation-api/app

   # Check EC2 instance status
   aws ec2 describe-instance-status --instance-ids <instance-id>
   ```

2. **Database Issues**:
   ```bash
   # Check RDS logs
   aws rds describe-db-log-files --db-instance-identifier recommendation-db

   # Check database connections
   psql -h <rds-endpoint> -U postgres -d recommendation_db -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Network Issues**:
   ```bash
   # Check security groups
   aws ec2 describe-security-groups --group-ids <sg-id>

   # Check VPC flow logs
   aws ec2 describe-flow-logs --filter Name=resource-id,Values=<vpc-id>
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
https://localhost:8000
```

### Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

### Endpoints

#### 1. Collection Management

##### Add Recommendation to Collection
```http
POST https://localhost:8000/add-to-collection
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
DELETE https://localhost:8000/remove-from-collection
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
GET https://localhost:8000/user/:userId/collections
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
GET https://localhost:8000/collection/:collectionId/recommendations
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
GET https://localhost:8000/collections
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
GET https://localhost:8000/recommendations
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
GET https://localhost:8000/users
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
GET https://localhost:8000/collection-recommendations
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
GET https://localhost:8000/collections?page=2&limit=20
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

## System Architecture Diagrams

### 1. Application Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Load Balancer                    │
│                     (Port 80, HTTP)                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Auto Scaling Group                          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  EC2 Instance │    │  EC2 Instance │    │  EC2 Instance │         │
│  │  Node.js App  │    │  Node.js App  │    │  Node.js App  │         │
│  │  Port 3000   │    │  Port 3000   │    │  Port 3000   │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RDS PostgreSQL 14.7                         │
│                     (Port 5432, Private)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Network Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                            VPC                                  │
│                     CIDR: 10.0.0.0/16                          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Public      │    │  Private     │    │  Private     │         │
│  │  Subnet      │    │  Subnet      │    │  Subnet      │         │
│  │  (ALB)       │    │  (EC2)       │    │  (RDS)       │         │
│  │  10.0.1.0/24 │    │  10.0.2.0/24 │    │  10.0.3.0/24 │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Security Groups                             │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  ALB SG     │    │  EC2 SG     │    │  RDS SG     │         │
│  │  In: 80     │    │  In: 22,3000│    │  In: 5432   │         │
│  │  Out: All   │    │  Out: All   │    │  Out: All   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Auto Scaling Configuration
```
┌─────────────────────────────────────────────────────────────────┐
│                     Auto Scaling Group                          │
│                                                                 │
│  Desired: 2    Min: 1    Max: 4                                │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Scale Up   │    │  Scale Down │    │  Cooldown   │         │
│  │  CPU > 70%  │    │  CPU < 30%  │    │  300s       │         │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘         │
│         │                  │                                   │
│         ▼                  ▼                                   │
│  ┌─────────────┐    ┌─────────────┐                           │
│  │  CloudWatch │    │  CloudWatch │                           │
│  │  Alarm      │    │  Alarm      │                           │
│  └─────────────┘    └─────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Database Schema
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     Users       │      │  Recommendations │      │   Collections   │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ fname           │      │ user_id (FK)    │      │ user_id (FK)    │
│ sname           │      │ title           │      │ title           │
│ profile_picture │      │ caption         │      │ created_at      │
│ bio             │      │ category        │      └────────┬────────┘
│ created_at      │      │ created_at      │               │
└────────┬────────┘      └────────┬────────┘               │
         │                        │                        │
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CollectionRecommendations                      │
├─────────────────────────────────────────────────────────────────┤
│ collection_id (PK,FK)                                           │
│ recommendation_id (PK,FK)                                       │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 5. API Flow
```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Client │     │   ALB   │     │  EC2    │     │  RDS    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │  HTTP/80      │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │  HTTP/3000    │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │  PostgreSQL   │
     │               │               │  /5432        │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │  Response     │
     │               │               │<──────────────│
     │               │               │               │
     │               │  Response     │               │
     │               │<──────────────│               │
     │               │               │               │
     │  Response     │               │               │
     │<──────────────│               │               │
     │               │               │               │
```

### 6. Data Flow
```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Client │     │  API    │     │ Sequelize│     │  DB     │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │  JSON Request │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │  Model        │               │
     │               │  Operations   │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │  SQL Query    │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │  SQL Result   │
     │               │               │<──────────────│
     │               │               │               │
     │               │  JSON Response│               │
     │               │<──────────────│               │
     │               │               │               │
     │  JSON Response│               │               │
     │<──────────────│               │               │
     │               │               │               │
```

## Dockerization

### Container Architecture

The application is containerized using Docker and Docker Compose, providing a consistent development and deployment environment. The setup includes:

1. **Application Container**:
   - Node.js 18 Alpine-based image
   - Express.js application server
   - Terraform and AWS CLI tools
   - Environment variables management
   - Volume mounts for code and dependencies

2. **Database Container**:
   - PostgreSQL 14 Alpine-based image
   - Persistent volume for data storage
   - Environment variables for configuration
   - Exposed port 5432 for database access

### Docker Features

1. **Multi-stage Build**:
   - Optimized image size using Alpine Linux
   - Separate build and runtime stages
   - Minimal dependencies

2. **Environment Management**:
   - Environment variables for configuration
   - AWS credentials management
   - Database connection settings
   - Application settings

3. **Volume Management**:
   - Persistent database storage
   - Live code reloading
   - Node modules caching
   - AWS credentials mounting

4. **Network Configuration**:
   - Internal network between containers
   - Exposed ports for API and database
   - Secure communication between services

### Docker Compose Features

1. **Service Orchestration**:
   - Automatic service startup
   - Dependency management
   - Health checks
   - Service scaling

2. **Development Workflow**:
   - Hot-reloading for development
   - Debugging support
   - Log management
   - Environment isolation

3. **Infrastructure as Code**:
   - Terraform integration
   - AWS CLI tools
   - Infrastructure management
   - Cloud resource provisioning

### Running with Docker

1. **Development Mode**:
```bash
# Build and start containers
docker-compose up --build

# View logs
docker-compose logs -f

# Access application
https://localhost:8000

# Access database
psql -h localhost -U postgres -d recommendation_db
```

2. **Production Mode**:
```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

3. **Infrastructure Management**:
```bash
# Access application container
docker-compose exec app bash

# Run Terraform commands
docker-compose exec app terraform init
docker-compose exec app terraform plan
docker-compose exec app terraform apply

# Run AWS CLI commands
docker-compose exec app aws ec2 describe-instances
```

### Docker Best Practices

1. **Security**:
   - Non-root user in containers
   - Minimal base images
   - Regular security updates
   - Secrets management

2. **Performance**:
   - Multi-stage builds
   - Layer optimization
   - Caching strategies
   - Resource limits

3. **Maintenance**:
   - Regular image updates
   - Log rotation
   - Backup strategies
   - Monitoring setup

4. **Development**:
   - Local development environment
   - Debugging tools
   - Testing frameworks
   - CI/CD integration

## Database Schema

### Overview

The database schema consists of four main tables with relationships designed to support the recommendation system:

1. **Users** - Stores user information
2. **Recommendations** - Stores recommendation items
3. **Collections** - Stores user collections
4. **CollectionRecommendations** - Junction table for collections and recommendations

### Table Definitions

#### 1. Users Table
```sql
CREATE TABLE Users (
    id BIGINT PRIMARY KEY,
    fname VARCHAR(255) NOT NULL,
    sname VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_created_at ON Users(created_at);
```

**Fields:**
- `id`: Unique identifier for the user
- `fname`: User's first name
- `sname`: User's surname
- `profile_picture`: URL to user's profile picture
- `bio`: User's biography text
- `created_at`: Timestamp of user creation

#### 2. Recommendations Table
```sql
CREATE TABLE Recommendations (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recommendations_user_id ON Recommendations(user_id);
CREATE INDEX idx_recommendations_category ON Recommendations(category);
CREATE INDEX idx_recommendations_created_at ON Recommendations(created_at);
```

**Fields:**
- `id`: Unique identifier for the recommendation
- `user_id`: Foreign key to Users table
- `title`: Title of the recommendation
- `caption`: Detailed description
- `category`: Category of the recommendation
- `created_at`: Timestamp of recommendation creation

#### 3. Collections Table
```sql
CREATE TABLE Collections (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_collections_user_id ON Collections(user_id);
CREATE INDEX idx_collections_created_at ON Collections(created_at);
```

**Fields:**
- `id`: Unique identifier for the collection
- `user_id`: Foreign key to Users table
- `title`: Title of the collection
- `created_at`: Timestamp of collection creation

#### 4. CollectionRecommendations Table
```sql
CREATE TABLE CollectionRecommendations (
    collection_id BIGINT NOT NULL REFERENCES Collections(id),
    recommendation_id BIGINT NOT NULL REFERENCES Recommendations(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, recommendation_id)
);

-- Indexes
CREATE INDEX idx_collection_recommendations_collection_id ON CollectionRecommendations(collection_id);
CREATE INDEX idx_collection_recommendations_recommendation_id ON CollectionRecommendations(recommendation_id);
```

**Fields:**
- `collection_id`: Foreign key to Collections table
- `recommendation_id`: Foreign key to Recommendations table
- `created_at`: Timestamp of when recommendation was added to collection

### Relationships

1. **Users to Recommendations** (One-to-Many):
   - One user can create many recommendations
   - Foreign key: `Recommendations.user_id` → `Users.id`

2. **Users to Collections** (One-to-Many):
   - One user can create many collections
   - Foreign key: `Collections.user_id` → `Users.id`

3. **Collections to Recommendations** (Many-to-Many):
   - One collection can contain many recommendations
   - One recommendation can be in many collections
   - Junction table: `CollectionRecommendations`

### Common Queries

1. **Get User's Collections with Recommendations**:
```sql
SELECT c.*, r.*, u.*
FROM Collections c
JOIN CollectionRecommendations cr ON c.id = cr.collection_id
JOIN Recommendations r ON cr.recommendation_id = r.id
JOIN Users u ON r.user_id = u.id
WHERE c.user_id = :userId;
```

2. **Get Recommendations in a Collection**:
```sql
SELECT r.*, u.*
FROM Recommendations r
JOIN CollectionRecommendations cr ON r.id = cr.recommendation_id
JOIN Users u ON r.user_id = u.id
WHERE cr.collection_id = :collectionId;
```

3. **Get User's Recommendations**:
```sql
SELECT r.*
FROM Recommendations r
WHERE r.user_id = :userId
ORDER BY r.created_at DESC;
```

### Database Maintenance

1. **Regular Maintenance**:
```sql
-- Analyze tables for query optimization
ANALYZE Users;
ANALYZE Recommendations;
ANALYZE Collections;
ANALYZE CollectionRecommendations;

-- Vacuum tables to reclaim space
VACUUM FULL Users;
VACUUM FULL Recommendations;
VACUUM FULL Collections;
VACUUM FULL CollectionRecommendations;
```

2. **Performance Monitoring**:
```sql
-- Check table sizes
SELECT pg_size_pretty(pg_total_relation_size('Users'));
SELECT pg_size_pretty(pg_total_relation_size('Recommendations'));
SELECT pg_size_pretty(pg_total_relation_size('Collections'));
SELECT pg_size_pretty(pg_total_relation_size('CollectionRecommendations'));

-- Check index usage
SELECT schemaname, relname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes;
```

3. **Backup and Restore**:
```bash
# Backup
pg_dump -h localhost -U postgres -d recommendation_db > backup.sql

# Restore
psql -h localhost -U postgres -d recommendation_db < backup.sql
```

### Data Validation

1. **Check Data Integrity**:
```sql
-- Check for orphaned recommendations
SELECT r.id
FROM Recommendations r
LEFT JOIN Users u ON r.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned collections
SELECT c.id
FROM Collections c
LEFT JOIN Users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Check for invalid collection-recommendation relationships
SELECT cr.*
FROM CollectionRecommendations cr
LEFT JOIN Collections c ON cr.collection_id = c.id
LEFT JOIN Recommendations r ON cr.recommendation_id = r.id
WHERE c.id IS NULL OR r.id IS NULL;
```

## Sequelize ORM Implementation

### Overview

Sequelize is used as the Object-Relational Mapping (ORM) tool to interact with the PostgreSQL database. It provides a robust set of features for database operations while maintaining type safety and query optimization.

### Model Definitions

1. **User Model**:
```javascript
const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      fname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  }

  static associate(models) {
    this.hasMany(models.Recommendation, { foreignKey: 'user_id' });
    this.hasMany(models.Collection, { foreignKey: 'user_id' });
  }
}
```

2. **Recommendation Model**:
```javascript
class Recommendation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Recommendation',
      tableName: 'Recommendations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsToMany(models.Collection, {
      through: models.CollectionRecommendation,
      foreignKey: 'recommendation_id'
    });
  }
}
```

3. **Collection Model**:
```javascript
class Collection extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Collection',
      tableName: 'Collections',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsToMany(models.Recommendation, {
      through: models.CollectionRecommendation,
      foreignKey: 'collection_id'
    });
  }
}
```

4. **CollectionRecommendation Model**:
```javascript
class CollectionRecommendation extends Model {
  static init(sequelize) {
    super.init({
      collection_id: {
        type: DataTypes.BIGINT,
        primaryKey: true
      },
      recommendation_id: {
        type: DataTypes.BIGINT,
        primaryKey: true
      }
    }, {
      sequelize,
      modelName: 'CollectionRecommendation',
      tableName: 'CollectionRecommendations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  }

  static associate(models) {
    this.belongsTo(models.Collection, { foreignKey: 'collection_id' });
    this.belongsTo(models.Recommendation, { foreignKey: 'recommendation_id' });
  }
}
```

### Best Practices

1. **Query Optimization**:
   - Use eager loading with `include`
   - Implement proper indexing
   - Use transactions for related operations
   - Implement pagination for large datasets

2. **Error Handling**:
```javascript
try {
  const result = await Model.operation();
} catch (error) {
  if (error instanceof Sequelize.ValidationError) {
    // Handle validation errors
  } else if (error instanceof Sequelize.DatabaseError) {
    // Handle database errors
  } else {
    // Handle other errors
  }
}
```

3. **Performance Tips**:
   - Use bulk operations for multiple records
   - Implement caching where appropriate
   - Monitor and optimize slow queries
   - Use appropriate data types

## Terraform Files Description

### 1. `main.tf`
```hcl
# Core infrastructure components
- VPC (Virtual Private Cloud) setup
- Internet Gateway for public internet access
- Public subnets in two availability zones
- Route tables and associations
- EC2 instance security group
- Initial EC2 instance configuration
```

### 2. `database.tf`
```hcl
# Database infrastructure
- RDS security group for PostgreSQL
- DB subnet group configuration
- PostgreSQL RDS instance setup
- Database parameter group
- Database backup configuration
```

### 3. `autoscaling.tf`
```hcl
# Auto-scaling configuration
- Launch template for EC2 instances
- Auto Scaling Group (ASG) setup
- Scaling policies for CPU utilization
- CloudWatch alarms for scaling triggers
- Target tracking scaling policies
```

### 4. `alb.tf`
```hcl
# Load Balancer configuration
- Application Load Balancer (ALB) setup
- ALB security group
- Target group for API instances
- Listener configuration
- Target group attachments
```

### 5. `variables.tf`
```hcl
# Variable definitions
- AWS region configuration
- VPC CIDR block
- Subnet CIDR blocks
- Instance types and sizes
- Database configuration
- Environment tags
```

### 6. `terraform.tfvars`
```hcl
# Variable values
- Actual values for variables defined in variables.tf
- Environment-specific configurations
- Resource sizes and counts
- Tag values
```

### 7. `provider.tf`
```hcl
# Provider configuration
- AWS provider setup
- Region specification
- Authentication configuration
```

### 8. `outputs.tf`
```hcl
# Output values
- VPC ID
- Public subnet IDs
- ALB DNS name
- RDS endpoint
- EC2 instance public IP
```

### Key Insights

1. **Infrastructure as Code Structure**
   - Modular design with separate files for different components
   - Clear separation of concerns
   - Easy to maintain and update individual components

2. **Security Considerations**
   - Security groups for each component
   - Private database access
   - Public access only through ALB
   - Proper network isolation

3. **Scalability Features**
   - Auto-scaling group for horizontal scaling
   - Load balancer for traffic distribution
   - Multi-AZ database setup
   - Flexible instance sizing

4. **High Availability**
   - Multi-AZ deployment
   - Auto-scaling capabilities
   - Load balanced architecture
   - Database backup configuration

5. **Cost Optimization**
   - Variable instance sizes
   - Configurable scaling policies
   - Flexible storage options
   - Environment-based resource sizing

