
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/practice-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
