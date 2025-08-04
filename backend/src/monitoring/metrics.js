const promClient = require('prom-client');

/**
 * Prometheus metrics collector for HMCTS Task API
 * Provides detailed application metrics for monitoring and alerting
 */
class MetricsCollector {
  constructor() {
    this.register = new promClient.Registry();
    this.setupDefaultMetrics();
    this.setupCustomMetrics();
  }

  setupDefaultMetrics() {
    // Collect default metrics (memory, CPU, etc.)
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: 'hmcts_task_api_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
    });
  }

  setupCustomMetrics() {
    // HTTP Request metrics
    this.httpRequestDuration = new promClient.Histogram({
      name: 'hmcts_task_api_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.httpRequestCount = new promClient.Counter({
      name: 'hmcts_task_api_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    // Database metrics
    this.dbConnectionPool = new promClient.Gauge({
      name: 'hmcts_task_api_db_connections_active',
      help: 'Number of active database connections'
    });

    this.dbQueryDuration = new promClient.Histogram({
      name: 'hmcts_task_api_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    this.dbQueryCount = new promClient.Counter({
      name: 'hmcts_task_api_db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status']
    });

    // Redis metrics
    this.redisConnectionCount = new promClient.Gauge({
      name: 'hmcts_task_api_redis_connections_active',
      help: 'Number of active Redis connections'
    });

    this.redisCacheHits = new promClient.Counter({
      name: 'hmcts_task_api_redis_cache_hits_total',
      help: 'Total number of Redis cache hits',
      labelNames: ['operation']
    });

    this.redisCacheMisses = new promClient.Counter({
      name: 'hmcts_task_api_redis_cache_misses_total',
      help: 'Total number of Redis cache misses',
      labelNames: ['operation']
    });

    // Task-specific metrics
    this.taskOperations = new promClient.Counter({
      name: 'hmcts_task_api_task_operations_total',
      help: 'Total number of task operations',
      labelNames: ['operation', 'status']
    });

    this.tasksByStatus = new promClient.Gauge({
      name: 'hmcts_task_api_tasks_by_status',
      help: 'Number of tasks by status',
      labelNames: ['status']
    });

    this.tasksByPriority = new promClient.Gauge({
      name: 'hmcts_task_api_tasks_by_priority',
      help: 'Number of tasks by priority',
      labelNames: ['priority']
    });

    // Security metrics
    this.authenticationAttempts = new promClient.Counter({
      name: 'hmcts_task_api_auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method', 'status']
    });

    this.rateLimitHits = new promClient.Counter({
      name: 'hmcts_task_api_rate_limit_hits_total',
      help: 'Total number of rate limit hits',
      labelNames: ['endpoint']
    });

    this.securityEvents = new promClient.Counter({
      name: 'hmcts_task_api_security_events_total',
      help: 'Total number of security events',
      labelNames: ['event_type', 'severity']
    });

    // Business metrics
    this.activeUsers = new promClient.Gauge({
      name: 'hmcts_task_api_active_users',
      help: 'Number of active users in the last 24 hours'
    });

    this.overdueTasks = new promClient.Gauge({
      name: 'hmcts_task_api_overdue_tasks',
      help: 'Number of overdue tasks'
    });

    this.averageTaskCompletionTime = new promClient.Histogram({
      name: 'hmcts_task_api_task_completion_time_hours',
      help: 'Average task completion time in hours',
      labelNames: ['priority'],
      buckets: [1, 4, 8, 24, 48, 72, 168]
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestCount);
    this.register.registerMetric(this.dbConnectionPool);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.dbQueryCount);
    this.register.registerMetric(this.redisConnectionCount);
    this.register.registerMetric(this.redisCacheHits);
    this.register.registerMetric(this.redisCacheMisses);
    this.register.registerMetric(this.taskOperations);
    this.register.registerMetric(this.tasksByStatus);
    this.register.registerMetric(this.tasksByPriority);
    this.register.registerMetric(this.authenticationAttempts);
    this.register.registerMetric(this.rateLimitHits);
    this.register.registerMetric(this.securityEvents);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.overdueTasks);
    this.register.registerMetric(this.averageTaskCompletionTime);
  }

  // HTTP Request tracking
  recordHttpRequest(method, route, statusCode, duration) {
    this.httpRequestDuration
      .labels(method, route, statusCode)
      .observe(duration);
    
    this.httpRequestCount
      .labels(method, route, statusCode)
      .inc();
  }

  // Database tracking
  recordDatabaseQuery(operation, table, duration, status = 'success') {
    this.dbQueryDuration
      .labels(operation, table)
      .observe(duration);
    
    this.dbQueryCount
      .labels(operation, table, status)
      .inc();
  }

  updateDatabaseConnections(count) {
    this.dbConnectionPool.set(count);
  }

  // Redis tracking
  recordCacheHit(operation) {
    this.redisCacheHits.labels(operation).inc();
  }

  recordCacheMiss(operation) {
    this.redisCacheMisses.labels(operation).inc();
  }

  updateRedisConnections(count) {
    this.redisConnectionCount.set(count);
  }

  // Task tracking
  recordTaskOperation(operation, status = 'success') {
    this.taskOperations.labels(operation, status).inc();
  }

  updateTaskCounts(statusCounts, priorityCounts) {
    // Update tasks by status
    Object.entries(statusCounts).forEach(([status, count]) => {
      this.tasksByStatus.labels(status).set(count);
    });

    // Update tasks by priority
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      this.tasksByPriority.labels(priority).set(count);
    });
  }

  recordTaskCompletion(priority, completionTimeHours) {
    this.averageTaskCompletionTime
      .labels(priority)
      .observe(completionTimeHours);
  }

  // Security tracking
  recordAuthAttempt(method, status) {
    this.authenticationAttempts.labels(method, status).inc();
  }

  recordRateLimitHit(endpoint) {
    this.rateLimitHits.labels(endpoint).inc();
  }

  recordSecurityEvent(eventType, severity) {
    this.securityEvents.labels(eventType, severity).inc();
  }

  // Business metrics
  updateActiveUsers(count) {
    this.activeUsers.set(count);
  }

  updateOverdueTasks(count) {
    this.overdueTasks.set(count);
  }

  // Middleware for Express.js
  middleware() {
    return (req, res, next) => {
      const start = Date.now();

      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = (...args) => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        
        this.recordHttpRequest(
          req.method,
          route,
          res.statusCode.toString(),
          duration
        );

        // Record rate limit hits
        if (res.statusCode === 429) {
          this.recordRateLimitHit(route);
        }

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  // Get metrics for Prometheus scraping
  async getMetrics() {
    return this.register.metrics();
  }

  // Clear all metrics (useful for testing)
  clearMetrics() {
    this.register.clear();
    this.setupDefaultMetrics();
    this.setupCustomMetrics();
  }
}

module.exports = new MetricsCollector();
