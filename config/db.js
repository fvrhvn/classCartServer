// MongoDB Atlas Connection (Native Driver - NO MONGOOSE)
// This file handles database connection using MongoDB native driver

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('ERROR: MONGODB_URI not found in .env file');
    console.error('Please configure your MongoDB Atlas connection string in .env');
    process.exit(1);
}

// Create MongoDB client with native driver
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

// Connect to MongoDB Atlas
async function connectDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Successfully connected to MongoDB Atlas!");
        
        // Get database instance
        db = client.db(process.env.DB_NAME || 'classcart');
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Get database instance
function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

// Close database connection
async function closeDB() {
    try {
        await client.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database:', error);
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};
