const xss = require('xss');
const logger = require('../utils/logger');

/**
 * Input sanitization middleware to prevent XSS and injection attacks
 * Implements OWASP guidelines for input validation and sanitization
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    next(error);
  }
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeKey(key);
    sanitized[sanitizedKey] = sanitizeObject(value);
  }

  return sanitized;
};

/**
 * Sanitize object keys
 */
const sanitizeKey = (key) => {
  if (typeof key !== 'string') {
    return key;
  }

  // Remove potentially dangerous characters from keys
  return key.replace(/[<>\"'&$]/g, '');
};

/**
 * Sanitize individual values based on type
 */
const sanitizeValue = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  // For other types, convert to string and sanitize
  return sanitizeString(String(value));
};

/**
 * Sanitize string values
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Basic XSS protection
  let sanitized = xss(str, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove or escape dangerous characters for SQL injection prevention
  // Note: This is additional protection, parameterized queries are the primary defense
  sanitized = sanitized.replace(/['";\\]/g, (match) => {
    switch (match) {
      case "'": return "&#x27;";
      case '"': return "&quot;";
      case ";": return "&#x3B;";
      case "\\": return "&#x5C;";
      default: return match;
    }
  });

  // Limit length to prevent DoS attacks
  if (sanitized.length > 10000) {
    logger.warn('Input length exceeds limit, truncating', {
      originalLength: sanitized.length,
      truncatedLength: 10000
    });
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
};

/**
 * Advanced sanitization for specific data types
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return email;
  }

  // Basic email format validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeString(email.toLowerCase().trim());
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

const sanitizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Remove all non-digit characters except +, -, (, ), and spaces
  return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim();
};

const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Validate and sanitize specific fields based on context
 */
const contextualSanitization = (fieldName, value) => {
  switch (fieldName.toLowerCase()) {
    case 'email':
      return sanitizeEmail(value);
    case 'phone':
    case 'phone_number':
      return sanitizePhoneNumber(value);
    case 'url':
    case 'website':
      return sanitizeUrl(value);
    default:
      return sanitizeValue(value);
  }
};

// Export individual functions for use in specific contexts
module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeString,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeUrl,
  contextualSanitization
};
