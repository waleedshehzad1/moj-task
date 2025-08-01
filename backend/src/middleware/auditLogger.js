const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Audit logging middleware for tracking user actions and system events
 * Implements comprehensive audit trail following security best practices
 */
const auditLogger = (req, res, next) => {
  // Generate unique request ID if not present
  if (!req.id) {
    req.id = req.headers['x-request-id'] || `req_${uuidv4()}`;
  }

  // Store request start time for performance monitoring
  req.startTime = process.hrtime.bigint();

  // Capture request details
  const requestDetails = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    headers: sanitizeHeaders(req.headers),
    query: req.query,
    params: req.params
  };

  // Add API key info if present
  if (req.apiKey) {
    requestDetails.apiKey = req.apiKey.key;
  }

  // Add user info if authenticated
  if (req.user) {
    requestDetails.user = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department
    };
  }

  // Add body for non-GET requests (sanitized)
  if (req.method !== 'GET' && req.body) {
    requestDetails.body = sanitizeBody(req.body, req.path);
  }

  // Log request
  logger.logAudit('HTTP_REQUEST', requestDetails);

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(body) {
    // Calculate response time
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - req.startTime) / 1000000; // Convert to milliseconds

    // Prepare response audit log
    const responseDetails = {
      requestId: req.id,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
      contentType: res.get('Content-Type'),
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    };

    // Add user info if authenticated
    if (req.user) {
      responseDetails.user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      };
    }

    // Log successful operations that modify data
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const action = getActionFromRequest(req);
        logger.logAudit('DATA_MODIFICATION', {
          ...responseDetails,
          action,
          resource: extractResourceFromPath(req.path),
          resourceId: req.params.id || null
        });
      }
    }

    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.logSecurityEvent('ACCESS_DENIED', {
        ...responseDetails,
        reason: res.statusCode === 401 ? 'Unauthorized' : 'Forbidden',
        endpoint: req.originalUrl
      });
    }

    // Log errors
    if (res.statusCode >= 400) {
      logger.logAudit('HTTP_ERROR', {
        ...responseDetails,
        error: body?.error || 'Unknown error',
        message: body?.message || 'No error message'
      });
    } else {
      logger.logAudit('HTTP_RESPONSE', responseDetails);
    }

    // Performance monitoring
    if (responseTime > 1000) { // Log slow requests (> 1 second)
      logger.logPerformance('SLOW_REQUEST', responseTime, {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode
      });
    }

    // Call original json method
    return originalJson.call(this, body);
  };

  // Continue to next middleware
  next();
};

/**
 * Sanitize request headers to remove sensitive information
 */
const sanitizeHeaders = (headers) => {
  const sensitiveHeaders = [
    'authorization',
    'x-api-key',
    'cookie',
    'set-cookie',
    'x-auth-token',
    'x-access-token'
  ];

  const sanitized = { ...headers };
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeBody = (body, path) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'password_hash',
    'token',
    'secret',
    'api_key',
    'private_key',
    'credit_card',
    'ssn',
    'social_security'
  ];

  const sanitized = { ...body };

  // Remove sensitive fields
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Special handling for auth endpoints
  if (path.includes('/auth/')) {
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.confirmPassword) sanitized.confirmPassword = '[REDACTED]';
    if (sanitized.oldPassword) sanitized.oldPassword = '[REDACTED]';
    if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
  }

  return sanitized;
};

/**
 * Extract action from HTTP method and path
 */
const getActionFromRequest = (req) => {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  const actionMap = {
    'POST': 'CREATE',
    'GET': 'READ',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };

  let action = actionMap[method] || 'UNKNOWN';

  // Special cases based on path
  if (path.includes('/login')) action = 'LOGIN';
  if (path.includes('/logout')) action = 'LOGOUT';
  if (path.includes('/register')) action = 'REGISTER';
  if (path.includes('/password')) action = 'PASSWORD_CHANGE';
  if (path.includes('/activate')) action = 'ACTIVATE';
  if (path.includes('/deactivate')) action = 'DEACTIVATE';

  return action;
};

/**
 * Extract resource type from request path
 */
const extractResourceFromPath = (path) => {
  const segments = path.split('/').filter(Boolean);
  
  // Remove API version
  if (segments[0] === 'api' && segments[1]?.startsWith('v')) {
    segments.splice(0, 2);
  }

  // Return first segment as resource type
  return segments[0] || 'unknown';
};

/**
 * Audit specific actions with detailed context
 */
const auditAction = (action, details = {}) => {
  return (req, res, next) => {
    const auditDetails = {
      action,
      requestId: req.id,
      timestamp: new Date().toISOString(),
      ...details
    };

    if (req.user) {
      auditDetails.user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      };
    }

    logger.logAudit('CUSTOM_ACTION', auditDetails);
    next();
  };
};

module.exports = {
  auditLogger,
  auditAction,
  sanitizeHeaders,
  sanitizeBody
};
