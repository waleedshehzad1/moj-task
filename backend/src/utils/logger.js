const winston = require('winston');
const path = require('path');

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
  silly: 'rainbow'
};

winston.addColors(logColors);

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV,
      service: 'hmcts-task-api',
      version: process.env.npm_package_version || '1.0.0',
      ...meta
    };

    if (stack) {
      logEntry.stack = stack;
    }

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Define transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  );
} else {
  // JSON console output for production (container logs)
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: customFormat,
      handleExceptions: true,
      handleRejections: true
    })
  );
}

// File transports for all environments
transports.push(
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, process.env.LOG_FILE_NAME || 'app.log'),
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    tailable: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'hmcts-task-api',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  exitOnError: false
});

// Add request logging helper
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    requestId: req.headers['x-request-id'] || 'unknown'
  };

  // Log user info if available
  if (req.user) {
    logData.userId = req.user.id;
    logData.userRole = req.user.role;
  }

  // Log query parameters (sanitized)
  if (Object.keys(req.query).length > 0) {
    logData.query = req.query;
  }

  // Determine log level based on status code
  if (res.statusCode >= 500) {
    logger.error('HTTP Request', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Add security event logging
logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    securityEvent: event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Add audit logging
logger.logAudit = (action, details = {}) => {
  logger.info('Audit Event', {
    auditAction: action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Add database operation logging
logger.logDatabase = (operation, table, details = {}) => {
  logger.debug('Database Operation', {
    dbOperation: operation,
    table,
    ...details
  });
};

// Add performance logging
logger.logPerformance = (operation, duration, details = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    format: customFormat
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    format: customFormat
  })
);

module.exports = logger;
