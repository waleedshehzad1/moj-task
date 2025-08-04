const Joi = require('joi');

/**
 * Validation schemas for task-related operations
 * Implements comprehensive input validation following OWASP guidelines
 */

// Base task schema
const taskBaseSchema = {
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),

  status: Joi.string()
    .valid('pending', 'in_progress', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed, cancelled',
      'any.required': 'Status is required'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),

  due_date: Joi.date()
    .iso()
    .when('$isTest', {
      is: true,
      then: Joi.date().iso(), // Allow any date for testing
      otherwise: Joi.date().iso().min('now') // Require future date for production
    })
    .required()
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.format': 'Due date must be in ISO format',
      'date.min': 'Due date must be in the future',
      'any.required': 'Due date is required'
    }),

  assigned_to: Joi.string()
    .uuid()
    .allow(null)
    .optional()
    .messages({
      'string.guid': 'Assigned to must be a valid UUID'
    }),

  estimated_hours: Joi.number()
    .precision(2)
    .min(0)
    .max(999.99)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Estimated hours must be a number',
      'number.min': 'Estimated hours cannot be negative',
      'number.max': 'Estimated hours cannot exceed 999.99'
    }),

  actual_hours: Joi.number()
    .precision(2)
    .min(0)
    .max(999.99)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Actual hours must be a number',
      'number.min': 'Actual hours cannot be negative',
      'number.max': 'Actual hours cannot exceed 999.99'
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),

  metadata: Joi.object()
    .default({})
    .messages({
      'object.base': 'Metadata must be an object'
    })
};

// Create task schema
const createTaskSchema = Joi.object({
  ...taskBaseSchema
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

// Update task schema (all fields optional except those specified)
const updateTaskSchema = Joi.object({
  title: taskBaseSchema.title.optional(),
  description: taskBaseSchema.description,
  status: taskBaseSchema.status.optional(),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  due_date: taskBaseSchema.due_date.optional(),
  assigned_to: taskBaseSchema.assigned_to,
  estimated_hours: taskBaseSchema.estimated_hours,
  actual_hours: taskBaseSchema.actual_hours,
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be an object'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
  'object.unknown': 'Unknown field: {{#label}}'
});

// Task status update schema (for specific status update endpoint)
const updateTaskStatusSchema = Joi.object({
  status: taskBaseSchema.status,
  actual_hours: taskBaseSchema.actual_hours
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

// Task query parameters schema
const taskQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  status: Joi.string()
    .valid('pending', 'in_progress', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed, cancelled'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),

  assigned_to: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Assigned to must be a valid UUID'
    }),

  due_before: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Due before must be a valid date',
      'date.format': 'Due before must be in ISO format'
    }),

  due_after: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Due after must be a valid date',
      'date.format': 'Due after must be in ISO format'
    }),

  sort_by: Joi.string()
    .valid('created_at', 'updated_at', 'due_date', 'priority', 'status', 'title')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, due_date, priority, status, title'
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    }),

  search: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 255 characters'
    }),

  tags: Joi.alternatives()
    .try(
      Joi.string().trim().max(50),
      Joi.array().items(Joi.string().trim().max(50)).max(10)
    )
    .optional()
    .messages({
      'alternatives.match': 'Tags must be a string or array of strings',
      'string.max': 'Each tag cannot exceed 50 characters',
      'array.max': 'Cannot filter by more than 10 tags'
    }),

  include_archived: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Include archived must be a boolean'
    })
}).messages({
  'object.unknown': 'Unknown query parameter: {{#label}}'
});

// Task ID parameter schema
const taskIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Task ID must be a valid UUID',
      'any.required': 'Task ID is required'
    })
}).messages({
  'object.unknown': 'Unknown parameter: {{#label}}'
});

// Bulk operations schema
const bulkUpdateTasksSchema = Joi.object({
  task_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.base': 'Task IDs must be an array',
      'array.min': 'At least one task ID is required',
      'array.max': 'Cannot update more than 50 tasks at once',
      'string.guid': 'Each task ID must be a valid UUID',
      'any.required': 'Task IDs are required'
    }),

  updates: Joi.object({
    status: taskBaseSchema.status.optional(),
    priority: taskBaseSchema.priority.optional(),
    assigned_to: taskBaseSchema.assigned_to,
    tags: taskBaseSchema.tags.optional()
  }).min(1).messages({
    'object.min': 'At least one update field must be provided'
  })
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskIdSchema,
  bulkUpdateTasksSchema
};
