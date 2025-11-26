// Static Image Middleware
// Serves images from Frontend/assets directory

const express = require('express');
const path = require('path');

// Middleware function to serve static images
const staticImages = express.static(
    path.join(__dirname, '../../Frontend/assets'),
    {
        // Options for serving static files
        maxAge: '1d', // Cache images for 1 day
        etag: true,
        lastModified: true
    }
);

// Log image requests (optional)
const imageLogger = (req, res, next) => {
    console.log(`[IMAGE] ${req.method} ${req.originalUrl}`);
    next();
};

module.exports = {
    staticImages,
    imageLogger
};


