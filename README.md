# Real Estate Listings API

A Real Estate Listings API built with Node.js, MySQL, and MongoDB.

## Tech Stack

- **Node.js** - Main API implementation
- **MySQL** - Relational storage
- **MongoDB** - Aggregation/statistics

## Quick Start

1. **Start all services:**
   ```bash
   docker compose up --build -d
   ```

2. **Verify services are running:**
   ```bash
   docker compose ps
   ```

3. **Test endpoints:**
   - Node.js API: http://localhost:3000
   - MySQL: localhost:3306
   - MongoDB: localhost:27017

## Services

- **MySQL** (Port 3306): Database with exam_db schema
- **MongoDB** (Port 27017): NoSQL database with agents, listings, views collections
- **Node.js** (Port 3000): Main API server

## Database Credentials

- **MySQL**: 
  - User: app_user
  - Password: app_password
  - Database: exam_db

- **MongoDB**:
  - User: root
  - Password: rootpassword
  - Database: realestate

## Development

To stop all services:
```bash
docker compose down
```

To view logs:
```bash
docker compose logs -f [service_name]
```