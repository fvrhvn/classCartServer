// Lessons Routes (Coursework Compliant)
// All lesson-related API endpoints using MongoDB native driver

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// GET /lessons - Get all lessons from MongoDB
router.get('/', handleLessonListRoute);

// GET /lessons/search - Full-text search (REQUIRED for coursework)
router.get('/search', handleLessonSearchRoute);

// GET /lessons/:id - Get single lesson by ID
router.get('/:id', handleSingleLessonRoute);

// PUT /lessons/:id - Update lesson (REQUIRED for coursework)
// Used to decrease available spaces when order is placed
router.put('/:id', handleLessonUpdateRoute);

module.exports = router;

async function handleLessonListRoute(req, res) {
    const db = startLessonListFetch();
    try {
        const lessons = await requestLessonListFromDatabase(db);
        finishLessonListFetch(res, lessons);
    } catch (error) {
        handleLessonListError(res, error);
    }
}

async function handleLessonSearchRoute(req, res) {
    const query = startLessonSearch(req);
    if (!query) {
        return respondMissingLessonSearchQuery(res);
    }

    try {
        const lessons = await requestLessonSearchResults(query);
        finishLessonSearch(res, query, lessons);
    } catch (error) {
        handleLessonSearchError(res, error);
    }
}

async function handleSingleLessonRoute(req, res) {
    const lessonId = startLessonLookup(req);
    if (!isValidLessonId(lessonId)) {
        return respondInvalidLessonId(res);
    }

    try {
        const lesson = await requestLessonById(lessonId);
        if (!lesson) {
            return respondLessonNotFound(res);
        }
        finishLessonLookup(res, lesson);
    } catch (error) {
        handleLessonFetchError(res, error);
    }
}

async function handleLessonUpdateRoute(req, res) {
    const lessonId = startLessonUpdate(req);
    if (!isValidLessonId(lessonId)) {
        return respondInvalidLessonId(res);
    }

    const availableSpaces = extractAvailableSpaces(req);
    if (!isValidAvailableSpaces(availableSpaces)) {
        return respondInvalidAvailableSpaces(res);
    }

    const db = getDB();

    try {
        const result = await requestLessonSpaceUpdate(db, lessonId, availableSpaces);
        if (result.matchedCount === 0) {
            return respondLessonNotFound(res);
        }

        const updatedLesson = await requestUpdatedLesson(db, lessonId);
        finishLessonUpdate(res, updatedLesson);
    } catch (error) {
        handleLessonUpdateError(res, error);
    }
}

function startLessonListFetch() {
    return getDB();
}

async function requestLessonListFromDatabase(db) {
    return db.collection('lessons').find({}).toArray();
}

function finishLessonListFetch(res, lessons) {
    res.json({
        success: true,
        count: lessons.length,
        data: lessons
    });
}

function handleLessonListError(res, error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
        success: false,
        message: 'Error fetching lessons',
        error: error.message
    });
}

function startLessonSearch(req) {
    return req.query.q;
}

function respondMissingLessonSearchQuery(res) {
    return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
    });
}

async function requestLessonSearchResults(query) {
    const db = getDB();
    const searchQuery = buildLessonSearchFilter(query);
    return db.collection('lessons').find(searchQuery).toArray();
}

function buildLessonSearchFilter(query) {
    return {
        $or: [
            { subject: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
        ]
    };
}

function finishLessonSearch(res, query, lessons) {
    res.json({
        success: true,
        query,
        count: lessons.length,
        data: lessons
    });
}

function handleLessonSearchError(res, error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({
        success: false,
        message: 'Error searching lessons',
        error: error.message
    });
}

function startLessonLookup(req) {
    return req.params.id;
}

function isValidLessonId(id) {
    return ObjectId.isValid(id);
}

function respondInvalidLessonId(res) {
    return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID format'
    });
}

async function requestLessonById(id) {
    const db = getDB();
    return db.collection('lessons').findOne({ _id: new ObjectId(id) });
}

function respondLessonNotFound(res) {
    return res.status(404).json({
        success: false,
        message: 'Lesson not found'
    });
}

function finishLessonLookup(res, lesson) {
    res.json({
        success: true,
        data: lesson
    });
}

function handleLessonFetchError(res, error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
        success: false,
        message: 'Error fetching lesson',
        error: error.message
    });
}

function startLessonUpdate(req) {
    return req.params.id;
}

function extractAvailableSpaces(req) {
    return req.body.availableSpaces;
}

function isValidAvailableSpaces(value) {
    return !(value === undefined || value < 0);
}

function respondInvalidAvailableSpaces(res) {
    return res.status(400).json({
        success: false,
        message: 'Valid availableSpaces value is required'
    });
}

async function requestLessonSpaceUpdate(db, lessonId, availableSpaces) {
    return db.collection('lessons').updateOne(
        { _id: new ObjectId(lessonId) },
        { $set: { availableSpaces } }
    );
}

async function requestUpdatedLesson(db, lessonId) {
    return db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });
}

function finishLessonUpdate(res, updatedLesson) {
    res.json({
        success: true,
        message: 'Lesson updated successfully',
        data: updatedLesson
    });
}

function handleLessonUpdateError(res, error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
        success: false,
        message: 'Error updating lesson',
        error: error.message
    });
}


