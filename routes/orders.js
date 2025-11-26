// Orders Routes (Coursework Compliant)
// All order-related API endpoints using MongoDB native driver

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// POST /orders - Create new order (REQUIRED for coursework)
router.post('/', async (req, res) => {
    try {
        const { name, phone, lessonIDs, numberOfSpaces } = req.body;
        
        // Validate required fields
        if (!name || !phone || !lessonIDs || !numberOfSpaces) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, phone, lessonIDs, numberOfSpaces'
            });
        }
        
        // Validate lessonIDs is an array
        if (!Array.isArray(lessonIDs) || lessonIDs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'lessonIDs must be a non-empty array'
            });
        }
        
        const db = getDB();
        
        // Create order object
        const order = {
            name: name.trim(),
            phone: phone.trim(),
            lessonIDs: lessonIDs.map(id => new ObjectId(id)),
            numberOfSpaces: parseInt(numberOfSpaces),
            createdAt: new Date(),
            status: 'confirmed'
        };
        
        // Insert order into MongoDB using native driver
        const result = await db.collection('orders').insertOne(order);
        
        // Get the created order with _id
        const createdOrder = await db.collection('orders').findOne({ 
            _id: result.insertedId 
        });
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: createdOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// GET /orders - Get all orders
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const orders = await db.collection('orders')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// GET /orders/:id - Get single order by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        
        const db = getDB();
        const order = await db.collection('orders').findOne({ 
            _id: new ObjectId(id) 
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

module.exports = router;
