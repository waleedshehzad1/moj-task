const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { connectRedis } = require('./config/redis');
const { syncDatabase } = require('./models');

// Import security middleware
const { sanitizeInput } = require('./middleware/sanitizeInput');
const { validateApiKey } = require('./middleware/validateApiKey');
const { auditLogger } = require('./middleware/auditLogger');

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Trust proxy (for load balancers, reverse proxies)
    this.app.set('trust proxy', 1);

    // Security middleware - OWASP recommendations
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // Rate limiting to prevent brute force attacks - More lenient for development
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 for dev, 100 for prod
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting in development for certain paths
        if (process.env.NODE_ENV === 'development') {
          return req.path.startsWith('/api/') || req.path.startsWith('/health');
        }
        return false;
      }
    });

    // Slow down repeated requests - Disabled in development
    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 50, // More lenient in dev
      delayMs: () => process.env.NODE_ENV === 'development' ? 0 : 100, // No delay in dev
      validate: { delayMs: false } // disable warning
    });

    this.app.use(limiter);
    this.app.use(speedLimiter);

    // CORS configuration - Allow frontend and development origins
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:3001',
          'http://127.0.0.1:3001',
          'http://localhost:3000',
          'http://127.0.0.1:3000'
        ];
        
        // In development, allow all localhost origins
        if (process.env.NODE_ENV === 'development') {
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count']
    };

    this.app.use(cors(corsOptions));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware with size limits
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Data sanitization against NoSQL injection attacks
    this.app.use(mongoSanitize());

    // Prevent parameter pollution attacks
    this.app.use(hpp());

    // Custom input sanitization middleware
    this.app.use(sanitizeInput);

    // HTTP request logger
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim())
        }
      }));
    }

    // Audit logging middleware
    this.app.use(auditLogger);

    // Health check endpoint (before API key validation)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
        uptime: process.uptime()
      });
    });

    // API documentation
    if (process.env.SWAGGER_ENABLED === 'true') {
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }
  }

  setupRoutes() {
    // API routes
    this.app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use(errorHandler);

    // Graceful shutdown handlers
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown();
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });
  }

  async gracefulShutdown() {
    logger.info('Received shutdown signal, starting graceful shutdown...');
    
    try {
      // Close server
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Close database connections
      const { sequelize } = require('./models');
      await sequelize.close();
      logger.info('Database connections closed');

      // Close Redis connection
      const redis = require('./config/redis');
      if (redis.client && redis.client.isOpen) {
        await redis.client.quit();
        logger.info('Redis connection closed');
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async start() {
    try {
      // Initialize database
      await syncDatabase();
      logger.info('Database synchronized successfully');

      // Initialize Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 HMCTS Task Management API server running on port ${this.port}`);
        logger.info(`📚 API Documentation available at http://localhost:${this.port}/api-docs`);
        logger.info(`🏥 Health check available at http://localhost:${this.port}/health`);
        logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      });

      // Handle server errors
      this.server.on('error', (error) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        switch (error.code) {
          case 'EACCES':
            logger.error(`Port ${this.port} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(`Port ${this.port} is already in use`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start application
const app = new Application();

// Start the server only if this file is run directly
if (require.main === module) {
  app.start();
}

module.exports = app.app;
