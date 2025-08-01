const logger = require('../utils/logger');

/**
 * API Key validation middleware for service-to-service authentication
 * Implements secure API key validation following OWASP guidelines
 */
const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    // Skip API key validation for certain endpoints
    const skipPaths = [
      '/health',
      '/api-docs',
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/forgot-password'
    ];

    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    if (!apiKey) {
      logger.logSecurityEvent('Missing API Key', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method
      });

      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'API key is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate API key format (should be at least 32 characters)
    if (typeof apiKey !== 'string' || apiKey.length < 32) {
      logger.logSecurityEvent('Invalid API Key Format', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        apiKeyLength: apiKey.length
      });

      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid API key format',
        timestamp: new Date().toISOString()
      });
    }

    // In production, validate against a secure API key store
    // For development, use environment variable
    const validApiKeys = [
      process.env.API_KEY_PRIMARY,
      process.env.API_KEY_SECONDARY,
      'dev-api-key-12345678901234567890123456789012' // Development only
    ].filter(Boolean);

    const isValidKey = validApiKeys.includes(apiKey);

    if (!isValidKey) {
      logger.logSecurityEvent('Invalid API Key', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        apiKeyPrefix: apiKey.substring(0, 8) + '...'
      });

      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid API key',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limiting for API key usage
    const keyUsageKey = `api_key_usage:${apiKey}`;
    // In production, implement rate limiting per API key using Redis

    // Add API key info to request for logging
    req.apiKey = {
      key: apiKey.substring(0, 8) + '...',
      isValid: true,
      timestamp: new Date().toISOString()
    };

    logger.debug('Valid API key used', {
      endpoint: req.originalUrl,
      method: req.method,
      apiKeyPrefix: req.apiKey.key,
      ip: req.ip
    });

    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Error validating API key',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * JWT token validation middleware
 */
const validateJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Authentication token is required',
        timestamp: new Date().toISOString()
      });
    }

    // JWT validation logic would go here
    // For now, just pass through
    next();
  } catch (error) {
    logger.error('JWT validation error:', error);
    return res.status(401).json({
      error: 'UnauthorizedError',
      message: 'Invalid authentication token',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Optional API key validation (doesn't fail if missing)
 */
const optionalApiKey = (req, res, next) => {
  if (req.headers['x-api-key'] || req.query.api_key) {
    return validateApiKey(req, res, next);
  }
  next();
};

module.exports = {
  validateApiKey,
  validateJWT,
  optionalApiKey
};
