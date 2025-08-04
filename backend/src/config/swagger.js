const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'HMCTS Task Management API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'Enterprise-grade API for managing caseworker tasks',
      contact: {
        name: 'HMCTS Development Team',
        email: 'dev-team@hmcts.net',
        url: 'https://hmcts.net'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/${process.env.API_VERSION || 'v1'}`,
        description: 'Development server'
      },
      {
        url: `https://api-staging.hmcts.net/api/${process.env.API_VERSION || 'v1'}`,
        description: 'Staging server'
      },
      {
        url: `https://api.hmcts.net/api/${process.env.API_VERSION || 'v1'}`,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service authentication'
        }
      },
      schemas: {
        Task: {
          type: 'object',
          required: ['title', 'status', 'due_date'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the task',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Task title',
              example: 'Review case documentation'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Optional task description',
              example: 'Review all submitted documents for case XYZ-123 and provide assessment'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'Current status of the task',
              example: 'pending'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date and time',
              example: '2024-12-31T23:59:59.000Z'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority level',
              example: 'medium'
            },
            assigned_to: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the caseworker assigned to this task',
              example: '456e7890-e89b-12d3-a456-426614174001'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp',
              example: '2024-01-15T10:30:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update timestamp',
              example: '2024-01-15T14:45:00.000Z'
            }
          }
        },
        TaskInput: {
          type: 'object',
          required: ['title', 'status', 'due_date'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Task title',
              example: 'Review case documentation'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Optional task description',
              example: 'Review all submitted documents for case XYZ-123 and provide assessment'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'Current status of the task',
              example: 'pending'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date and time',
              example: '2024-12-31T23:59:59.000Z'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority level',
              example: 'medium'
            },
            assigned_to: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the caseworker assigned to this task',
              example: '456e7890-e89b-12d3-a456-426614174001'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'ValidationError'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid task data provided'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'title'
                  },
                  message: {
                    type: 'string',
                    example: 'Title is required'
                  }
                }
              },
              description: 'Detailed error information'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
              example: '2024-01-15T10:30:00.000Z'
            },
            requestId: {
              type: 'string',
              description: 'Unique request identifier for tracking',
              example: 'req_123456789'
            }
          }
        },
        PaginatedTasks: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  minimum: 1,
                  example: 1
                },
                limit: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  example: 10
                },
                total: {
                  type: 'integer',
                  minimum: 0,
                  example: 25
                },
                totalPages: {
                  type: 'integer',
                  minimum: 0,
                  example: 3
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true
                },
                hasPreviousPage: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
