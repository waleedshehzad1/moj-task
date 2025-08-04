const Joi = require('joi');

/**
 * Validation middleware factory
 * Creates validation middleware for different parts of the request
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let dataToValidate;

    switch (source) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      case 'headers':
        dataToValidate = req.headers;
        break;
      default:
        dataToValidate = req.body;
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all validation errors, not just the first one
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true, // Remove unknown fields from the validated data
      convert: true // Convert strings to numbers, dates, etc. where appropriate
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the original data with the validated and sanitized data
    switch (source) {
      case 'body':
        req.body = value;
        break;
      case 'query':
        req.query = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'headers':
        req.headers = value;
        break;
    }

    next();
  };
};

/**
 * Validate request body
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL parameters
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Validate headers
 */
const validateHeaders = (schema) => validate(schema, 'headers');

/**
 * Combine multiple validations
 */
const validateMultiple = (validations) => {
  return (req, res, next) => {
    const runValidation = (index) => {
      if (index >= validations.length) {
        return next();
      }

      const validation = validations[index];
      validation(req, res, (err) => {
        if (err) return next(err);
        runValidation(index + 1);
      });
    };

    runValidation(0);
  };
};

/**
 * Custom validation helpers
 */
const customValidators = {
  // UUID validation
  uuid: Joi.string().uuid().messages({
    'string.guid': 'Must be a valid UUID'
  }),

  // Email validation with custom rules
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .max(255)
    .messages({
      'string.email': 'Must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters'
    }),

  // Password validation (strong password requirements)
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),

  // Phone number validation
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d\-\(\)\s]{7,20}$/)
    .messages({
      'string.pattern.base': 'Must be a valid phone number'
    }),

  // URL validation
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .messages({
      'string.uri': 'Must be a valid HTTP or HTTPS URL'
    }),

  // Date validation (ISO 8601 format)
  isoDate: Joi.date()
    .iso()
    .messages({
      'date.format': 'Must be a valid ISO 8601 date'
    }),

  // Pagination parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // Sorting parameters
  sorting: Joi.object({
    sort_by: Joi.string().required(),
    sort_order: Joi.string().valid('asc', 'desc').default('asc')
  })
};

/**
 * Schema composition helpers
 */
const compose = {
  /**
   * Create a paginated query schema
   */
  withPagination: (baseSchema) => {
    return baseSchema.concat(customValidators.pagination);
  },

  /**
   * Create a sortable query schema
   */
  withSorting: (baseSchema, allowedSortFields) => {
    const sortingSchema = Joi.object({
      sort_by: Joi.string().valid(...allowedSortFields).default(allowedSortFields[0]),
      sort_order: Joi.string().valid('asc', 'desc').default('asc')
    });
    return baseSchema.concat(sortingSchema);
  },

  /**
   * Make all fields in a schema optional
   */
  makeOptional: (schema) => {
    const optionalSchema = {};
    Object.keys(schema.describe().keys).forEach(key => {
      optionalSchema[key] = schema.extract(key).optional();
    });
    return Joi.object(optionalSchema);
  }
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateMultiple,
  customValidators,
  compose
};
