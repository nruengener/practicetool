const { AppError } = require('./errors');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid input data',
      errors: errors
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return res.status(400).json({
      status: 'fail',
      message: `Duplicate field value: ${value}. Please use another value.`
    });
  }

  // Handle mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // For development, send detailed error
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // For production, send generic error
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

module.exports = errorHandler;