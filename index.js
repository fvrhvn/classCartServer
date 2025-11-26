// CLASSCART BACKEND SERVER (Coursework Compliant)
// Main entry point for Express.js API server
// Uses MongoDB Atlas with Native Driver (NO MONGOOSE)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const { connectDB } = require('./config/db');

// Import routes
const lessonRoutes = require('./routes/lessons');
const orderRoutes = require('./routes/orders');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { staticImages, imageLogger } = require('./middleware/staticImages');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Static Image Middleware (REQUIRED for coursework)
// Serves images from Frontend/assets at /images endpoint
app.use('/images', imageLogger, staticImages);

// API Routes (REQUIRED structure for coursework)
app.use('/lessons', lessonRoutes);  // All lesson endpoints
app.use('/orders', orderRoutes);    // All order endpoints

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ClassCart API Server - Coursework Compliant',
        version: '1.0.0',
        database: 'MongoDB Atlas (Native Driver)',
        endpoints: {
            lessons: {
                getAll: 'GET /lessons',
                search: 'GET /lessons/search?q=query',
                getOne: 'GET /lessons/:id',
                update: 'PUT /lessons/:id'
            },
            orders: {
                create: 'POST /orders',
                getAll: 'GET /orders',
                getOne: 'GET /orders/:id'
            },
            images: 'GET /images/:filename'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'MongoDB Atlas Connected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedPath: req.path
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server and connect to MongoDB
async function startServer() {
    try {
        // Connect to MongoDB Atlas first
        await connectDB();
        
        // Then start Express server
        app.listen(PORT, () => {
            console.log('===========================================');
            console.log('  ClassCart Backend Server (Coursework)');
            console.log('===========================================');
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`✅ API URL: http://localhost:${PORT}`);
            console.log(`✅ Database: MongoDB Atlas (Native Driver)`);
            console.log('');
            console.log('📚 Endpoints:');
            console.log(`   GET  /lessons`);
            console.log(`   GET  /lessons/search?q=query`);
            console.log(`   GET  /lessons/:id`);
            console.log(`   PUT  /lessons/:id`);
            console.log(`   POST /orders`);
            console.log(`   GET  /orders`);
            console.log(`   GET  /images/:filename`);
            console.log('===========================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
