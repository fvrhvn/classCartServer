const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const classRoutes = require('./routes/classes');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const logger = require('./middleware/log');

const imageMiddleware = require('./middleware/image');


// apply the logger
const MONGO_URI = process.env.DB_URI;

const app = express();
app.use(cors({
  origin: ["http://localhost:53123", "null", "http://localhost:3000", "https://fvrhvn.github.io"],
  methods: "GET,POST,PUT,DELETE",
}));

app.use(bodyParser.json());
app.use(logger);
app.get('/images/:filename', imageMiddleware);

// MongoDB connection URL
const client = new MongoClient(MONGO_URI);

async function startServer() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Select database and collections
    const db = client.db('classcart'); 
    const classesCollection = db.collection('lesson_list'); // collection name
    const cartCollection = db.collection('cart');
    const cartOrderCollection = db.collection('cart_order');

    app.use((req, res, next) => {
      req.db = db;
      req.classes = classesCollection;
      req.cart = cartCollection;
      req.cart_order = cartOrderCollection;
      next();
    });

    // Routes
    app.use('/api/classes', classRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/checkout', checkoutRoutes);

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

startServer();
