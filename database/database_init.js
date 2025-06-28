# // database/init_db.js
# // Run this script to initialize your MongoDB database

const { MongoClient } = require('mongodb');

async function initializeDatabase() {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  const dbName = 'auth_system';

  try {
    // Connect to MongoDB
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB server');

    // Get database reference
    const db = client.db(dbName);
    
    // Create users collection
    const usersCollection = db.collection('users');
    
    // Create unique index on email field
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('Created unique index on email field');
    
    console.log('Database initialization complete');
    
    // Close connection
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

//Run the initialization function
initializeDatabase();