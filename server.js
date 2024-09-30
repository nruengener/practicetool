const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Connect to local MongoDB
const mongoURI = 'mongodb://localhost:27017/practice_app';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to local MongoDB'))
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
