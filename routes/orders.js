// Orders Routes (Coursework Compliant)
// All order-related API endpoints using MongoDB native driver

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// POST /orders - Create new order (REQUIRED for coursework)
router.post('/', handleOrderCreationRoute);

// GET /orders - Get all orders
router.get('/', handleOrderListRoute);

// GET /orders/:id - Get single order by ID
router.get('/:id', handleSingleOrderRoute);

module.exports = router;

async function handleOrderCreationRoute(req, res) {
    const payload = startOrderCreation(req);

    if (!hasRequiredOrderFields(payload)) {
        return respondMissingOrderFields(res);
    }

    if (!isLessonIdArrayValid(payload.lessonIDs)) {
        return respondInvalidLessonIdArray(res);
    }

    try {
        const order = createOrderDocument(payload);
        const createdOrder = await requestOrderInsertion(order);
        finishOrderCreation(res, createdOrder);
    } catch (error) {
        handleOrderCreationError(res, error);
    }
}

async function handleOrderListRoute(req, res) {
    try {
        const db = startOrderListFetch();
        const orders = await requestOrderList(db);
        finishOrderListFetch(res, orders);
    } catch (error) {
        handleOrderListError(res, error);
    }
}

async function handleSingleOrderRoute(req, res) {
    const orderId = startOrderLookup(req);
    if (!isValidOrderId(orderId)) {
        return respondInvalidOrderId(res);
    }

    try {
        const order = await requestOrderById(orderId);
        if (!order) {
            return respondOrderNotFound(res);
        }
        finishOrderLookup(res, order);
    } catch (error) {
        handleSingleOrderError(res, error);
    }
}

function startOrderCreation(req) {
    return req.body;
}

function hasRequiredOrderFields(payload) {
    const { name, phone, lessonIDs, numberOfSpaces } = payload || {};
    return Boolean(name && phone && lessonIDs && numberOfSpaces);
}

function respondMissingOrderFields(res) {
    return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, lessonIDs, numberOfSpaces'
    });
}

function isLessonIdArrayValid(lessonIDs) {
    return Array.isArray(lessonIDs) && lessonIDs.length > 0;
}

function respondInvalidLessonIdArray(res) {
    return res.status(400).json({
        success: false,
        message: 'lessonIDs must be a non-empty array'
    });
}

function createOrderDocument(payload) {
    return {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        lessonIDs: payload.lessonIDs.map(id => new ObjectId(id)),
        numberOfSpaces: parseInt(payload.numberOfSpaces),
        createdAt: new Date(),
        status: 'confirmed'
    };
}

async function requestOrderInsertion(order) {
    const db = getDB();
    const result = await db.collection('orders').insertOne(order);
    return db.collection('orders').findOne({ _id: result.insertedId });
}

function finishOrderCreation(res, createdOrder) {
    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: createdOrder
    });
}

function handleOrderCreationError(res, error) {
    console.error('Error creating order:', error);
    res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message
    });
}

function startOrderListFetch() {
    return getDB();
}

async function requestOrderList(db) {
    return db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

function finishOrderListFetch(res, orders) {
    res.json({
        success: true,
        count: orders.length,
        data: orders
    });
}

function handleOrderListError(res, error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
    });
}

function startOrderLookup(req) {
    return req.params.id;
}

function isValidOrderId(id) {
    return ObjectId.isValid(id);
}

function respondInvalidOrderId(res) {
    return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
    });
}

async function requestOrderById(id) {
    const db = getDB();
    return db.collection('orders').findOne({ _id: new ObjectId(id) });
}

function respondOrderNotFound(res) {
    return res.status(404).json({
        success: false,
        message: 'Order not found'
    });
}

function finishOrderLookup(res, order) {
    res.json({
        success: true,
        data: order
    });
}

function handleSingleOrderError(res, error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
        success: false,
        message: 'Error fetching order',
        error: error.message
    });
}
