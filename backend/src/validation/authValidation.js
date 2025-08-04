const Joi = require('joi');

/**
 * Validation schemas for authentication endpoints
 * Implements comprehensive input validation following OWASP guidelines
 */

// Password validation schema
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

// Email validation schema
const emailSchema = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: true } })
  .max(255)
  .required()
  .messages({
    'string.email': 'Must be a valid email address',
    'string.max': 'Email must not exceed 255 characters',
    'any.required': 'Email is required'
  });

// Username validation schema
const usernameSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(100)
  .required()
  .messages({
    'string.alphanum': 'Username must contain only alphanumeric characters',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 100 characters',
    'any.required': 'Username is required'
  });

// Name validation schema
const nameSchema = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .pattern(/^[a-zA-Z\s\-']+$/)
  .required()
  .messages({
    'string.min': 'Name must be at least 1 character long',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'any.required': 'Name is required'
  });

// Phone validation schema
const phoneSchema = Joi.string()
  .pattern(/^[\+]?[0-9\-\(\)\s]+$/)
  .max(20)
  .optional()
  .messages({
    'string.pattern.base': 'Phone number must be valid',
    'string.max': 'Phone number must not exceed 20 characters'
  });

// Role validation schema
const roleSchema = Joi.string()
  .valid('admin', 'manager', 'caseworker', 'viewer')
  .default('caseworker')
  .messages({
    'any.only': 'Role must be one of: admin, manager, caseworker, viewer'
  });

// Department validation schema
const departmentSchema = Joi.string()
  .trim()
  .max(100)
  .optional()
  .messages({
    'string.max': 'Department must not exceed 100 characters'
  });

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  role: roleSchema,
  department: departmentSchema,
  phone: phoneSchema
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.max': 'Email/username must not exceed 255 characters',
      'any.required': 'Email or username is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  email: emailSchema
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  password: passwordSchema
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: passwordSchema
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Update profile validation schema
 */
const updateProfileSchema = Joi.object({
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  phone: phoneSchema,
  department: departmentSchema,
  preferences: Joi.object()
    .optional()
    .messages({
      'object.base': 'Preferences must be a valid object'
    })
}).options({ 
  stripUnknown: true,
  abortEarly: false,
  allowUnknown: false
});

/**
 * Email verification validation schema
 */
const emailVerificationSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required'
    })
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

/**
 * Resend email verification validation schema
 */
const resendVerificationSchema = Joi.object({
  email: emailSchema
}).options({ 
  stripUnknown: true,
  abortEarly: false 
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  emailVerificationSchema,
  resendVerificationSchema,
  
  // Individual schemas for reuse
  passwordSchema,
  emailSchema,
  usernameSchema,
  nameSchema,
  phoneSchema,
  roleSchema,
  departmentSchema
};
