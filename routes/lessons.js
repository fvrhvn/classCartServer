// Lessons Routes (Coursework Compliant)
// All lesson-related API endpoints using MongoDB native driver

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// GET /lessons - Get all lessons from MongoDB
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const lessons = await db.collection('lessons').find({}).toArray();
        
        res.json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lessons',
            error: error.message
        });
    }
});

// GET /lessons/search - Full-text search (REQUIRED for coursework)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query parameter "q" is required'
            });
        }
        
        const db = getDB();
        
        // Full-text search using $regex (case-insensitive)
        // Searches across subject, location
        const searchQuery = {
            $or: [
                { subject: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } }
            ]
        };
        
        const lessons = await db.collection('lessons')
            .find(searchQuery)
            .toArray();
        
        res.json({
            success: true,
            query: q,
            count: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error('Error searching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching lessons',
            error: error.message
        });
    }
});

// GET /lessons/:id - Get single lesson by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID format'
            });
        }
        
        const db = getDB();
        const lesson = await db.collection('lessons').findOne({ 
            _id: new ObjectId(id) 
        });
        
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }
        
        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lesson',
            error: error.message
        });
    }
});

// PUT /lessons/:id - Update lesson (REQUIRED for coursework)
// Used to decrease available spaces when order is placed
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { availableSpaces } = req.body;
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID format'
            });
        }
        
        // Validate availableSpaces
        if (availableSpaces === undefined || availableSpaces < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid availableSpaces value is required'
            });
        }
        
        const db = getDB();
        
        // Update lesson using native driver updateOne()
        const result = await db.collection('lessons').updateOne(
            { _id: new ObjectId(id) },
            { $set: { availableSpaces: availableSpaces } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }
        
        // Fetch updated lesson
        const updatedLesson = await db.collection('lessons').findOne({ 
            _id: new ObjectId(id) 
        });
        
        res.json({
            success: true,
            message: 'Lesson updated successfully',
            data: updatedLesson
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lesson',
            error: error.message
        });
    }
});

module.exports = router;


