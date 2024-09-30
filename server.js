const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017';
const dbName = 'practice_app';

// Create a new MongoClient
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    app.locals.db = client.db(dbName);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Import and use entry routes
const entryRoutes = require('./routes/entries');
app.use('/entries', entryRoutes);

// Import and use routine routes
const routineRoutes = require('./routes/routines');
app.use('/routines', routineRoutes);

// Import and use selected routine routes
const selectedRoutineRoutes = require('./routes/selectedRoutine');
app.use('/selected-routine', selectedRoutineRoutes);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
