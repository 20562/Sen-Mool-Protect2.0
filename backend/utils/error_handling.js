const logger = require('../config/logger');
const { AppError } = require('./errors');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Default error
  let error = err;

  if (!(err instanceof AppError)) {
    // Handle Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors)
        .map(e => e.message)
        .join(', ');
      error = new AppError(message, 400, 'VALIDATION_ERROR');
    }
    // Handle Mongoose duplicate key error
    else if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      error = new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY');
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401, 'JWT_ERROR');
    }
    // Handle generic errors
    else {
      error = new AppError(err.message || 'Internal server error', 500, 'INTERNAL_ERROR');
    }
  }

  // Log error
  logger.error({
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: sanitizeBody(req.body),
    },
  });

  // Send response
  res.status(error.statusCode).json({
    error: {
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sanitize sensitive data from request body
const sanitizeBody = (body) => {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });

  return sanitized;
};

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, i);
      logger.warn(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`, {
        error: error.message,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Circuit breaker pattern for external services
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  sanitizeBody,
  retryWithBackoff,
  CircuitBreaker,
};
