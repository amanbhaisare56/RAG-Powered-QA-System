const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { 
    message: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  // Don't leak stack traces in production
  const response = {
    error: err.message || 'Internal server error'
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(response);
};

module.exports = errorHandler;