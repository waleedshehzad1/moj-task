const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis');

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and populates req.user
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Authentication token is required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'hmcts-task-api',
      audience: 'hmcts-task-frontend'
    });

    // Find user
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      logger.logSecurityEvent('JWT Authentication Failed - User Not Found/Inactive', {
        userId: decoded.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });

      return res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user account is locked
    if (user.isLocked()) {
      logger.logSecurityEvent('JWT Authentication Failed - Account Locked', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        lockedUntil: user.locked_until
      });

      return res.status(423).json({
        success: false,
        error: 'AccountLocked',
        message: 'Account is temporarily locked',
        lockedUntil: user.locked_until,
        timestamp: new Date().toISOString()
      });
    }

    // Check session validity if Redis is available
    if (redisClient && redisClient.isOpen) {
      const sessionKeys = await redisClient.keys(`session:*`);
      let validSession = false;

      for (const sessionKey of sessionKeys) {
        const sessionData = await redisClient.get(sessionKey);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.userId === user.id) {
            validSession = true;
            // Update last activity
            session.lastActivity = new Date().toISOString();
            await redisClient.setEx(sessionKey, parseInt(process.env.JWT_EXPIRES_IN_SECONDS) || 3600, JSON.stringify(session));
            break;
          }
        }
      }

      if (!validSession) {
        logger.logSecurityEvent('JWT Authentication Failed - No Valid Session', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl
        });

        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Session expired or invalid',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Add user to request object
    req.user = user;
    req.tokenPayload = decoded;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.logSecurityEvent('JWT Token Expired', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        expiredAt: error.expiredAt
      });

      return res.status(401).json({
        success: false,
        error: 'TokenExpiredError',
        message: 'Token has expired',
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.logSecurityEvent('JWT Validation Failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        error: error.message
      });

      return res.status(401).json({
        success: false,
        error: 'JsonWebTokenError',
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }

    logger.error('JWT authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Sets req.user if valid token is provided, but doesn't fail if no token
 */
const optionalAuthenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'hmcts-task-api',
        audience: 'hmcts-task-frontend'
      });

      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active && !user.isLocked()) {
        req.user = user;
        req.tokenPayload = decoded;
      }
    } catch (tokenError) {
      // Invalid token, but continue without authentication
      logger.debug('Optional JWT authentication failed:', tokenError.message);
    }

    next();

  } catch (error) {
    logger.error('Optional JWT authentication error:', error);
    next(); // Continue without authentication on errors
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurityEvent('Authorization Failed - Insufficient Permissions', {
        userId: req.user.id,
        email: req.user.email,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        error: 'ForbiddenError',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!req.user.hasPermission(permission)) {
      logger.logSecurityEvent('Authorization Failed - Permission Denied', {
        userId: req.user.id,
        email: req.user.email,
        userRole: req.user.role,
        requiredPermission: permission,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        error: 'ForbiddenError',
        message: `Permission denied: ${permission}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources or has admin/manager role
 */
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    // Admin and manager can access all resources
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    // Get user ID from request (params, body, or query)
    const resourceUserId = req.params[userIdField] || 
                          req.body[userIdField] || 
                          req.query[userIdField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      logger.logSecurityEvent('Authorization Failed - Resource Access Denied', {
        userId: req.user.id,
        email: req.user.email,
        userRole: req.user.role,
        requestedResourceUserId: resourceUserId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        error: 'ForbiddenError',
        message: 'Access denied: You can only access your own resources',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = (req, res, next) => {
  // This would integrate with the existing rate limiting middleware
  // For now, just pass through as rate limiting is handled in app.js
  next();
};

module.exports = {
  authenticateJWT,
  optionalAuthenticateJWT,
  requireRole,
  requirePermission,
  requireOwnership,
  authRateLimit
};
