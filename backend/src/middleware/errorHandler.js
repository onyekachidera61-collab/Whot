import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Validation errors
  if (err.status === 400 || err.message === 'Validation failed') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || []
    });
  }

  // Authentication errors
  if (err.status === 401 || err.message === 'Unauthorized') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Authorization errors
  if (err.status === 403 || err.message === 'Forbidden') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions'
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'Resource not found'
    });
  }

  // Database errors
  if (err.name === 'SequelizeError' || err.name === 'DatabaseError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while processing your request'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.error || 'Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};

export default errorHandler;