const OneAgent = require('@dynatrace/oneagent-sdk');

/**
 * Dynatrace monitoring integration for HMCTS Task API
 * Provides comprehensive application performance monitoring
 */
class DynatraceMonitoring {
  constructor() {
    this.oneagent = null;
    this.isEnabled = process.env.DYNATRACE_ENABLED === 'true';
    this.tenantId = process.env.DYNATRACE_TENANT_ID;
    this.apiToken = process.env.DYNATRACE_API_TOKEN;
    
    if (this.isEnabled && this.tenantId && this.apiToken) {
      this.initialize();
    }
  }

  initialize() {
    try {
      this.oneagent = OneAgent({
        tenant: this.tenantId,
        token: this.apiToken,
        applicationId: 'hmcts-task-api',
        applicationName: 'HMCTS Task Management API',
        environment: process.env.NODE_ENV || 'development'
      });

      // Set custom properties
      this.oneagent.addCustomProperty('service.name', 'hmcts-task-api');
      this.oneagent.addCustomProperty('service.version', process.env.npm_package_version || '1.0.0');
      this.oneagent.addCustomProperty('deployment.environment', process.env.NODE_ENV);
      this.oneagent.addCustomProperty('team', 'hmcts-platform');
      
      console.log('✅ Dynatrace OneAgent initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Dynatrace OneAgent:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Create a custom service for database operations
   */
  createDatabaseService(operation, table) {
    if (!this.isEnabled || !this.oneagent) return null;

    return this.oneagent.createCustomService({
      serviceName: `Database - ${table}`,
      serviceMethod: operation,
      serviceEndpoint: `postgres://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });
  }

  /**
   * Create a custom service for Redis operations
   */
  createRedisService(operation, key) {
    if (!this.isEnabled || !this.oneagent) return null;

    return this.oneagent.createCustomService({
      serviceName: 'Redis Cache',
      serviceMethod: operation,
      serviceEndpoint: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });
  }

  /**
   * Create a custom service for external API calls
   */
  createExternalService(serviceName, endpoint, method) {
    if (!this.isEnabled || !this.oneagent) return null;

    return this.oneagent.createCustomService({
      serviceName: serviceName,
      serviceMethod: method,
      serviceEndpoint: endpoint
    });
  }

  /**
   * Add custom metrics
   */
  addCustomMetric(name, value, dimensions = {}) {
    if (!this.isEnabled || !this.oneagent) return;

    try {
      this.oneagent.addCustomMetric({
        metricName: name,
        value: value,
        dimensions: dimensions
      });
    } catch (error) {
      console.error('Failed to add custom metric:', error);
    }
  }

  /**
   * Add user action
   */
  addUserAction(actionName, userId, properties = {}) {
    if (!this.isEnabled || !this.oneagent) return;

    try {
      this.oneagent.addUserAction({
        name: actionName,
        userId: userId,
        properties: properties
      });
    } catch (error) {
      console.error('Failed to add user action:', error);
    }
  }

  /**
   * Report an error
   */
  reportError(error, context = {}) {
    if (!this.isEnabled || !this.oneagent) return;

    try {
      this.oneagent.reportError({
        error: error,
        context: context,
        fingerprint: this.generateErrorFingerprint(error),
        severity: this.getErrorSeverity(error)
      });
    } catch (reportingError) {
      console.error('Failed to report error to Dynatrace:', reportingError);
    }
  }

  /**
   * Generate error fingerprint for better error grouping
   */
  generateErrorFingerprint(error) {
    const stack = error.stack || '';
    const message = error.message || '';
    
    // Create a fingerprint based on error type and first few stack frames
    const stackLines = stack.split('\n').slice(0, 3).join('|');
    return `${error.name}:${message}:${stackLines}`.substring(0, 100);
  }

  /**
   * Determine error severity based on error type
   */
  getErrorSeverity(error) {
    if (error.name === 'ValidationError') return 'LOW';
    if (error.name === 'UnauthorizedError') return 'MEDIUM';
    if (error.name === 'DatabaseError') return 'HIGH';
    if (error.name === 'SecurityError') return 'CRITICAL';
    
    return 'MEDIUM';
  }

  /**
   * Middleware for Express.js integration
   */
  middleware() {
    return (req, res, next) => {
      if (!this.isEnabled || !this.oneagent) {
        return next();
      }

      // Start tracing the request
      const trace = this.oneagent.startServerSideTrace({
        traceId: req.headers['x-trace-id'] || this.generateTraceId(),
        spanId: this.generateSpanId(),
        operationName: `${req.method} ${req.route?.path || req.path}`,
        tags: {
          'http.method': req.method,
          'http.url': req.originalUrl,
          'http.user_agent': req.get('User-Agent'),
          'user.id': req.user?.id,
          'request.id': req.id
        }
      });

      // Add trace ID to response headers
      res.setHeader('X-Trace-ID', trace.traceId);

      // Override res.end to capture response data
      const originalEnd = res.end;
      res.end = (...args) => {
        trace.setTag('http.status_code', res.statusCode);
        trace.setTag('response.size', res.get('Content-Length') || 0);
        
        if (res.statusCode >= 400) {
          trace.setTag('error', true);
          trace.setTag('error.status', res.statusCode);
        }

        trace.finish();
        originalEnd.apply(res, args);
      };

      req.dynatrace = {
        trace,
        addTag: (key, value) => trace.setTag(key, value),
        addMetric: (name, value, dimensions) => this.addCustomMetric(name, value, dimensions),
        reportError: (error, context) => this.reportError(error, context)
      };

      next();
    };
  }

  /**
   * Generate a unique trace ID
   */
  generateTraceId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a unique span ID
   */
  generateSpanId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Shutdown Dynatrace monitoring
   */
  shutdown() {
    if (this.isEnabled && this.oneagent) {
      try {
        this.oneagent.shutdown();
        console.log('✅ Dynatrace OneAgent shutdown successfully');
      } catch (error) {
        console.error('❌ Failed to shutdown Dynatrace OneAgent:', error);
      }
    }
  }
}

// Export singleton instance
module.exports = new DynatraceMonitoring();
