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
    
    if (!uri) {
        console.error('❌ ERROR: MONGODB_URI not found in .env file');
        console.error('Please configure your MongoDB Atlas connection string first.');
        process.exit(1);
    }
    
    const client = new MongoClient(uri);
    
    try {
        console.log('Connecting to MongoDB Atlas...');
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        const db = client.db(process.env.DB_NAME || 'classcart');
        
        // Clear existing lessons (optional - remove if you want to keep existing data)
        console.log('\nClearing existing lessons...');
        await db.collection('lessons').deleteMany({});
        console.log('✅ Existing lessons cleared');
        
        // Insert lessons
        console.log('\nInserting lessons...');
        const result = await db.collection('lessons').insertMany(lessons);
        console.log(`✅ Successfully inserted ${result.insertedCount} lessons`);
        
        // Create text index for search functionality
        console.log('\nCreating text index for search...');
        await db.collection('lessons').createIndex({ 
            subject: 'text', 
            location: 'text' 
        });
        console.log('✅ Text index created');
        
        // Display inserted lessons
        console.log('\n📚 Inserted Lessons:');
        lessons.forEach((lesson, index) => {
            console.log(`   ${index + 1}. ${lesson.subject} (${lesson.location}) - £${lesson.price}`);
        });
        
        console.log('\n✅ Database seeding completed successfully!');
        console.log('You can now start your server with: npm start');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\nDatabase connection closed.');
    }
}

// Run the seed function
seedDatabase();


