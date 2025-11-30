// Database Seed Script
// Populates MongoDB with initial lesson data
// Run this ONCE after setting up MongoDB Atlas: node Backend/seed.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Your 10 educational lessons
const lessons = [
    {
        subject: 'Mobile App Development',
        location: 'Birmingham',
        price: 88.99,
        availableSpaces: 10,
        image: 'logo-mobile.svg',
        description: 'Learn to build mobile applications for iOS and Android'
    },
    {
        subject: 'Artificial Intelligence & Machine Learning',
        location: 'West-Ham',
        price: 149.99,
        availableSpaces: 8,
        image: 'logo-ai-ml.svg',
        description: 'Master AI and ML concepts with hands-on projects'
    },
    {
        subject: 'Cloud Computing with AWS or Azure Lab Course',
        location: 'Newcastle',
        price: 99.99,
        availableSpaces: 5,
        image: 'logo-cloud.svg',
        description: 'Learn cloud infrastructure and services'
    },
    {
        subject: 'Cybersecurity Basics',
        location: 'Bristol',
        price: 250,
        availableSpaces: 5,
        image: 'logo-cybersecurity.svg',
        description: 'Essential cybersecurity principles and practices'
    },
    {
        subject: 'UI/UX Design Principles',
        location: 'Brentford',
        price: 220,
        availableSpaces: 5,
        image: 'logo-figma.svg',
        description: 'Create beautiful and user-friendly interfaces'
    },
    {
        subject: 'Project Management',
        location: 'Manchester',
        price: 250,
        availableSpaces: 5,
        image: 'logo-jira.svg',
        description: 'Master project management methodologies'
    },
    {
        subject: 'Computer Science',
        location: 'Villa-park',
        price: 200,
        availableSpaces: 10,
        image: 'logo-compsci.svg',
        description: 'Fundamentals of computer science and programming'
    },
    {
        subject: 'Database Design & SQL',
        location: 'Leicester',
        price: 199,
        availableSpaces: 7,
        image: 'logo-database.svg',
        description: 'Learn database design and SQL queries'
    },
    {
        subject: 'Backend Development with Node.js',
        location: 'Norwich',
        price: 209,
        availableSpaces: 5,
        image: 'logo-node.svg',
        description: 'Build scalable backend applications with Node.js'
    },
    {
        subject: 'Python Programming',
        location: 'Liverpool',
        price: 150,
        availableSpaces: 12,
        image: 'logo-python.svg',
        description: 'Learn Python programming from basics to advanced'
    }
];

async function seedDatabase() {
    const uri = process.env.MONGODB_URI;
    validateSeedEnvironment(uri);
    
    const client = createSeedClient(uri);
    
    try {
        await connectSeedClient(client);
        const db = selectSeedDatabase(client);
        await clearExistingLessons(db);
        await insertSeedLessons(db);
        await createLessonSearchIndex(db);
        logInsertedLessonSummary();
        logSeedCompletion();
    } catch (error) {
        handleSeedError(error);
    } finally {
        await closeSeedClient(client);
    }
}

function validateSeedEnvironment(uri) {
    if (!uri) {
        console.error('❌ ERROR: MONGODB_URI not found in .env file');
        console.error('Please configure your MongoDB Atlas connection string first.');
        process.exit(1);
    }
}

function createSeedClient(uri) {
    return new MongoClient(uri);
}

async function connectSeedClient(client) {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
}

function selectSeedDatabase(client) {
    return client.db(process.env.DB_NAME || 'classcart');
}

async function clearExistingLessons(db) {
    console.log('\nClearing existing lessons...');
    await db.collection('lessons').deleteMany({});
    console.log('✅ Existing lessons cleared');
}

async function insertSeedLessons(db) {
    console.log('\nInserting lessons...');
    const result = await db.collection('lessons').insertMany(lessons);
    console.log(`✅ Successfully inserted ${result.insertedCount} lessons`);
}

async function createLessonSearchIndex(db) {
    console.log('\nCreating text index for search...');
    await db.collection('lessons').createIndex({ 
        subject: 'text', 
        location: 'text' 
    });
    console.log('✅ Text index created');
}

function logInsertedLessonSummary() {
    console.log('\n📚 Inserted Lessons:');
    lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.subject} (${lesson.location}) - £${lesson.price}`);
    });
}

function logSeedCompletion() {
    console.log('\n✅ Database seeding completed successfully!');
    console.log('You can now start your server with: npm start');
}

function handleSeedError(error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
}

async function closeSeedClient(client) {
    await client.close();
    console.log('\nDatabase connection closed.');
}

// Run the seed function
seedDatabase();


