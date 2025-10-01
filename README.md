# Real Estate Listings API

A Real Estate Listings API built with Node.js, MySQL, MongoDB, and Laravel.

## Tech Stack

- **Node.js** - Main API with Express.js
- **MySQL** - Relational storage
- **MongoDB** - Aggregation/statistics
- **Laravel** - Legacy PHP endpoint

## Setup Instructions

1. **Start all services:**
   ```bash
   docker compose up --build -d
   ```

2. **Test endpoints:**
   - Node.js API: http://localhost:3000
   - Laravel API: http://localhost:8000

## API Endpoints

### Node.js API (Port 3000)
- `GET /listings` - Get all listings
- `GET /listings/:id` - Get specific listing
- `POST /listings` - Create listing
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing
- `GET /stats/active-agents` - Active agents statistics

### Laravel API (Port 8000)
- `GET /laravel/listings` - Get all listings (legacy format)

## Database Credentials

- **MySQL**: app_user / app_password (exam_db)
- **MongoDB**: root / rootpassword (realestate)

## Choices and Decisions Made

1. **Docker Compose** - Easy setup and consistent environment
2. **Separate Databases** - MySQL for CRUD, MongoDB for aggregation
3. **Laravel Official Tools** - Used `composer create-project` for clean structure
4. **File Sessions** - Avoided database sessions complexity
5. **Consistent Error Format** - JSON error responses across all APIs
6. **Data Formatting** - Price to 2 decimals, city capitalization

## What I Would Improve (Given More Than 4 Hours)

1. **Testing** - Unit tests, integration tests, API testing
2. **Validation** - Input validation, data sanitization
3. **Security** - Authentication, rate limiting, CORS
4. **Documentation** - Swagger/OpenAPI docs
5. **Performance** - Database indexes, connection pooling
6. **Monitoring** - Logging, health checks, metrics
7. **Code Quality** - ESLint, code standards, modular structure