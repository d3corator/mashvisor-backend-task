const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'app_user',
  password: process.env.MYSQL_PASSWORD || 'app_password',
  database: process.env.MYSQL_DATABASE || 'exam_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;
let mongoClient;
let mongoDb;

// Initialize database connections with retry
async function initDB() {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds
  
  // Initialize MySQL connection
  for (let i = 0; i < maxRetries; i++) {
    try {
      db = await mysql.createConnection(dbConfig);
      console.log('Connected to MySQL database');
      break;
    } catch (error) {
      console.log(`MySQL connection attempt ${i + 1}/${maxRetries} failed:`, error.message);
      if (i === maxRetries - 1) {
        console.error('MySQL connection failed after all retries:', error);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // Initialize MongoDB connection
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017/realestate?authSource=admin';
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db('realestate');
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Utility function to format error response
function formatError(message) {
  return { error: true, message };
}

// Utility function to capitalize city name
function capitalizeCity(city) {
  return city.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Utility function to format price to 2 decimal places
function formatPrice(price) {
  return parseFloat(price).toFixed(2);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real Estate API is running' });
});

// GET /listings - Get all listings
app.get('/listings', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, title, city, price, bedrooms, agent_id as agentId, created_at, updated_at 
      FROM listings 
      ORDER BY created_at DESC
    `);
    
    const formattedListings = rows.map(listing => ({
      ...listing,
      city: capitalizeCity(listing.city),
      price: formatPrice(listing.price)
    }));
    
    res.json(formattedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json(formatError('Failed to fetch listings'));
  }
});

// GET /listings/:id - Get single listing
app.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT id, title, city, price, bedrooms, agent_id as agentId, created_at, updated_at FROM listings WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json(formatError('Listing not found'));
    }
    
    const listing = rows[0];
    listing.city = capitalizeCity(listing.city);
    listing.price = formatPrice(listing.price);
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json(formatError('Failed to fetch listing'));
  }
});

// POST /listings - Create new listing
app.post('/listings', async (req, res) => {
  try {
    const { title, city, price, bedrooms, agentId } = req.body;
    
    // Validation
    if (!title || !city || !price || !bedrooms || !agentId) {
      return res.status(400).json(formatError('Missing required fields: title, city, price, bedrooms, agentId'));
    }
    
    if (isNaN(price) || price <= 0) {
      return res.status(400).json(formatError('Price must be a positive number'));
    }
    
    if (!Number.isInteger(bedrooms) || bedrooms < 0) {
      return res.status(400).json(formatError('Bedrooms must be a non-negative integer'));
    }
    
    if (!Number.isInteger(agentId) || agentId <= 0) {
      return res.status(400).json(formatError('AgentId must be a positive integer'));
    }
    
    // Store city in lowercase as per requirements
    const [result] = await db.execute(
      'INSERT INTO listings (title, city, price, bedrooms, agent_id) VALUES (?, ?, ?, ?, ?)',
      [title, city.toLowerCase(), price, bedrooms, agentId]
    );
    
    // Fetch the created listing
    const [rows] = await db.execute(
      'SELECT id, title, city, price, bedrooms, agent_id as agentId, created_at, updated_at FROM listings WHERE id = ?',
      [result.insertId]
    );
    
    const listing = rows[0];
    listing.city = capitalizeCity(listing.city);
    listing.price = formatPrice(listing.price);
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json(formatError('Failed to create listing'));
  }
});

// PUT /listings/:id - Update listing
app.put('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, city, price, bedrooms, agentId } = req.body;
    
    // Check if listing exists
    const [existingRows] = await db.execute('SELECT id FROM listings WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json(formatError('Listing not found'));
    }
    
    // Validation
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res.status(400).json(formatError('Price must be a positive number'));
    }
    
    if (bedrooms !== undefined && (!Number.isInteger(bedrooms) || bedrooms < 0)) {
      return res.status(400).json(formatError('Bedrooms must be a non-negative integer'));
    }
    
    if (agentId !== undefined && (!Number.isInteger(agentId) || agentId <= 0)) {
      return res.status(400).json(formatError('AgentId must be a positive integer'));
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city.toLowerCase());
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (bedrooms !== undefined) {
      updates.push('bedrooms = ?');
      values.push(bedrooms);
    }
    if (agentId !== undefined) {
      updates.push('agent_id = ?');
      values.push(agentId);
    }
    
    if (updates.length === 0) {
      return res.status(400).json(formatError('No fields to update'));
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Fetch the updated listing
    const [rows] = await db.execute(
      'SELECT id, title, city, price, bedrooms, agent_id as agentId, created_at, updated_at FROM listings WHERE id = ?',
      [id]
    );
    
    const listing = rows[0];
    listing.city = capitalizeCity(listing.city);
    listing.price = formatPrice(listing.price);
    
    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json(formatError('Failed to update listing'));
  }
});

// DELETE /listings/:id - Delete listing
app.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists
    const [existingRows] = await db.execute('SELECT id FROM listings WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json(formatError('Listing not found'));
    }
    
    await db.execute('DELETE FROM listings WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json(formatError('Failed to delete listing'));
  }
});

// GET /stats/active-agents - MongoDB aggregation for active agents stats
app.get('/stats/active-agents', async (req, res) => {
  try {
    // MongoDB aggregation pipeline
    const pipeline = [
      // Stage 1: Match only active agents
      {
        $match: { active: true }
      },
      // Stage 2: Lookup listings from MongoDB (join with listings collection)
      {
        $lookup: {
          from: 'listings',
          localField: '_id',
          foreignField: 'agentId',
          as: 'listings'
        }
      },
      // Stage 3: Filter listings with price > 300,000
      {
        $addFields: {
          filteredListings: {
            $filter: {
              input: '$listings',
              cond: { $gt: ['$$this.price', 300000] }
            }
          }
        }
      },
      // Stage 4: Lookup views for each filtered listing
      {
        $lookup: {
          from: 'views',
          localField: 'filteredListings._id',
          foreignField: 'listingId',
          as: 'views'
        }
      },
      // Stage 5: Calculate total views and listings count
      {
        $addFields: {
          listings: { $size: '$filteredListings' },
          totalViews: {
            $sum: '$views.views'
          }
        }
      },
      // Stage 6: Project final fields
      {
        $project: {
          agent: '$name',
          listings: 1,
          totalViews: 1,
          _id: 0
        }
      },
      // Stage 7: Sort by totalViews descending
      {
        $sort: { totalViews: -1 }
      }
    ];

    const result = await mongoDb.collection('agents').aggregate(pipeline).toArray();
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching active agents stats:', error);
    res.status(500).json(formatError('Failed to fetch active agents statistics'));
  }
});

// Basic routes placeholder
app.get('/', (req, res) => {
  res.json({ 
    message: 'Real Estate Listings API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      listings: {
        'GET /listings': 'Get all listings',
        'GET /listings/:id': 'Get single listing',
        'POST /listings': 'Create new listing',
        'PUT /listings/:id': 'Update listing',
        'DELETE /listings/:id': 'Delete listing'
      },
      stats: {
        'GET /stats/active-agents': 'Get active agents statistics with listings and views'
      }
    }
  });
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});