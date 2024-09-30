require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./errorMiddleware');
const { connectDB, closeDB } = require('./db');
const { NotFoundError } = require('./errors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
app.use(morgan('[:date[clf]] :method :url :status :response-time ms - :res[content-length]'));

app.use(express.json());

// Routes
const entryRoutes = require('./routes/entries');
const routineRoutes = require('./routes/routines');
const selectedRoutineRoutes = require('./routes/selectedRoutine');
const entryRecordRoutes = require('./routes/entryRecords');

app.use('/api/entries', entryRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/selected-routine', selectedRoutineRoutes);
app.use('/api/entry-records', entryRecordRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Error handling middleware
app.use(errorHandler);

let server;

const startServer = async () => {
  await connectDB();
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

const shutDown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    closeDB().then(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

startServer();

module.exports = app;
