const logger = require('../utils/logger');

/**
 * Global error handler middleware
 *
 * Normalizes framework/ORM/JWT errors into a consistent JSON shape, logs with
 * request context, and avoids leaking sensitive details in production.
 * Maps common Sequelize + JWT errors to 4xx; everything else defaults to 500.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Generate unique request ID for tracking
  const requestId = req.headers['x-request-id'] || 
                   req.id || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log error with context
  const errorContext = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params
  };

  if (req.user) {
    errorContext.userId = req.user.id;
    errorContext.userRole = req.user.role;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'NotFoundError', message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `${field} already exists`;
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to related resource';
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { name: 'UnauthorizedError', message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { name: 'UnauthorizedError', message, statusCode: 401 };
  }

  // Express validator errors
  if (err.name === 'ValidationError' && err.array) {
    const message = err.array().map(e => e.msg).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.name === 'TooManyRequests') {
    const message = 'Too many requests, please try again later';
    error = { name: 'TooManyRequests', message, statusCode: 429 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server Error', { ...errorContext, error: error.message });
  } else if (statusCode >= 400) {
    logger.warn('Client Error', { ...errorContext, error: error.message });
  }

  // Security logging for authentication/authorization errors
  if (statusCode === 401 || statusCode === 403) {
    logger.logSecurityEvent('Authentication/Authorization Failure', {
      requestId,
      statusCode,
      message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });
  }

  // Prepare error response (consistent shape for frontend consumption)
  const errorResponse = {
    error: error.name || 'Error',
    message,
    requestId,
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Add detailed validation errors if available
  if (error.name === 'ValidationError' && err.errors) {
    if (Array.isArray(err.errors)) {
      // Express validator format
      errorResponse.details = err.errors.map(e => ({
        field: e.param || e.path,
        message: e.msg || e.message,
        value: e.value
      }));
    } else if (typeof err.errors === 'object') {
      // Sequelize format
      errorResponse.details = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
    }
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
