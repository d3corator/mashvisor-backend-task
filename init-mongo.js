// MongoDB initialization script
db = db.getSiblingDB('realestate');

// Create collections and insert data
db.createCollection('agents');
db.createCollection('listings');
db.createCollection('views');

// Insert agents data
db.agents.insertMany([
  { "_id": 101, "name": "Alice Smith", "active": true },
  { "_id": 102, "name": "Bob Johnson", "active": false },
  { "_id": 103, "name": "Carol Lee", "active": true }
]);

// Insert listings data
db.listings.insertMany([
  { "_id": 1, "title": "Modern Apartment", "city": "New York", "agentId": 101, "price": 250000 },
  { "_id": 2, "title": "Cozy Suburban Home", "city": "Chicago", "agentId": 102, "price": 320000 },
  { "_id": 3, "title": "Luxury Condo", "city": "New York", "agentId": 103, "price": 450000 }
]);

// Insert views data
db.views.insertMany([
  { "listingId": 1, "date": "2025-09-01", "views": 100 },
  { "listingId": 1, "date": "2025-09-10", "views": 80 },
  { "listingId": 2, "date": "2025-09-05", "views": 50 },
  { "listingId": 3, "date": "2025-09-08", "views": 200 }
]);

print('MongoDB initialization completed');