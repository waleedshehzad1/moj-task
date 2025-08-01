const { sequelize } = require('../models');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const metricsCollector = require('../monitoring/metrics');

/**
 * Comprehensive Health Check Service
 * Monitors all critical system components and external dependencies
 */
class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.registerHealthChecks();
  }

  /**
   * Register all health check functions
   */
  registerHealthChecks() {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('redis', this.checkRedis.bind(this));
    this.checks.set('memory', this.checkMemory.bind(this));
    this.checks.set('disk', this.checkDisk.bind(this));
    this.checks.set('environment', this.checkEnvironment.bind(this));
    this.checks.set('external_dependencies', this.checkExternalDependencies.bind(this));
  }

  /**
   * Run all health checks
   * @returns {Object} Health check results
   */
  async runAllChecks() {
    const startTime = Date.now();
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Run all health checks
    for (const [name, checkFunction] of this.checks) {
      try {
        const checkResult = await checkFunction();
        results.checks[name] = checkResult;
        results.summary.total++;

        switch (checkResult.status) {
          case 'healthy':
            results.summary.passed++;
            break;
          case 'warning':
            results.summary.warnings++;
            break;
          case 'unhealthy':
            results.summary.failed++;
            results.status = 'unhealthy';
            break;
        }
      } catch (error) {
        results.checks[name] = {
          status: 'unhealthy',
          message: error.message,
          timestamp: new Date().toISOString()
        };
        results.summary.total++;
        results.summary.failed++;
        results.status = 'unhealthy';
      }
    }

    // Overall status determination
    if (results.summary.failed > 0) {
      results.status = 'unhealthy';
    } else if (results.summary.warnings > 0) {
      results.status = 'warning';
    }

    const duration = Date.now() - startTime;
    results.duration = `${duration}ms`;

    // Record metrics
    metricsCollector.recordHealthCheck(results.status, duration);

    return results;
  }

  /**
   * Check database connectivity and performance
   */
  async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Test connection
      await sequelize.authenticate();
      
      // Test query performance
      const queryStartTime = Date.now();
      await sequelize.query('SELECT 1 as test');
      const queryDuration = Date.now() - queryStartTime;
      
      // Get connection pool status
      const pool = sequelize.connectionManager.pool;
      const poolStatus = {
        totalConnections: pool.size,
        activeConnections: pool.pending,
        idleConnections: pool.available
      };

      const duration = Date.now() - startTime;
      let status = 'healthy';
      let message = 'Database connection is healthy';

      // Check for performance issues
      if (queryDuration > 1000) {
        status = 'warning';
        message = `Database response slow: ${queryDuration}ms`;
      } else if (queryDuration > 5000) {
        status = 'unhealthy';
        message = `Database response very slow: ${queryDuration}ms`;
      }

      // Check connection pool
      if (poolStatus.totalConnections >= 25) {
        status = 'warning';
        message = 'Database connection pool near capacity';
      }

      return {
        status,
        message,
        duration: `${duration}ms`,
        queryDuration: `${queryDuration}ms`,
        pool: poolStatus,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  async checkRedis() {
    const startTime = Date.now();
    
    try {
      if (!redisClient || !redisClient.isOpen) {
        return {
          status: 'unhealthy',
          message: 'Redis client not available or not connected',
          timestamp: new Date().toISOString()
        };
      }

      // Test ping
      const pingStartTime = Date.now();
      const pong = await redisClient.ping();
      const pingDuration = Date.now() - pingStartTime;

      // Test set/get operations
      const testKey = `health_check_${Date.now()}`;
      const testValue = 'test_value';
      
      await redisClient.set(testKey, testValue, { EX: 60 });
      const retrievedValue = await redisClient.get(testKey);
      await redisClient.del(testKey);

      const duration = Date.now() - startTime;
      let status = 'healthy';
      let message = 'Redis connection is healthy';

      // Check performance
      if (pingDuration > 100) {
        status = 'warning';
        message = `Redis response slow: ${pingDuration}ms`;
      } else if (pingDuration > 500) {
        status = 'unhealthy';
        message = `Redis response very slow: ${pingDuration}ms`;
      }

      // Verify test operation
      if (retrievedValue !== testValue) {
        status = 'unhealthy';
        message = 'Redis set/get operation failed';
      }

      return {
        status,
        message,
        duration: `${duration}ms`,
        pingDuration: `${pingDuration}ms`,
        ping: pong,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Redis connection failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check memory usage
   */
  async checkMemory() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryUtilization = (usedMemory / totalMemory) * 100;

    let status = 'healthy';
    let message = `Memory utilization: ${memoryUtilization.toFixed(2)}%`;

    if (memoryUtilization > 80) {
      status = 'warning';
      message = `High memory utilization: ${memoryUtilization.toFixed(2)}%`;
    } else if (memoryUtilization > 95) {
      status = 'unhealthy';
      message = `Critical memory utilization: ${memoryUtilization.toFixed(2)}%`;
    }

    return {
      status,
      message,
      memory: {
        heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
        utilization: `${memoryUtilization.toFixed(2)}%`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check disk space (simplified check)
   */
  async checkDisk() {
    try {
      // This is a simplified check - in production you'd use fs.stat or similar
      // For now, we'll just check if we can write to the temp directory
      const fs = require('fs').promises;
      const path = require('path');
      const testFile = path.join(process.cwd(), 'temp_health_check.txt');
      
      await fs.writeFile(testFile, 'health check test');
      await fs.unlink(testFile);

      return {
        status: 'healthy',
        message: 'Disk write test successful',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Disk write test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check environment configuration
   */
  async checkEnvironment() {
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'DB_HOST',
      'DB_NAME',
      'DB_USERNAME',
      'REDIS_HOST',
      'JWT_SECRET'
    ];

    const missingVars = [];
    const presentVars = [];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        presentVars.push(envVar);
      } else {
        missingVars.push(envVar);
      }
    }

    let status = 'healthy';
    let message = 'All required environment variables are present';

    if (missingVars.length > 0) {
      status = 'unhealthy';
      message = `Missing required environment variables: ${missingVars.join(', ')}`;
    }

    // Check for weak JWT secret in production
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'dev-secret-key-change-in-production-2024') {
      status = 'warning';
      message = 'Using default JWT secret in production environment';
    }

    return {
      status,
      message,
      environment: process.env.NODE_ENV,
      requiredVars: {
        total: requiredEnvVars.length,
        present: presentVars.length,
        missing: missingVars.length
      },
      missingVars,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check external dependencies
   */
  async checkExternalDependencies() {
    const dependencies = [];

    // This is where you'd check external APIs, services, etc.
    // For now, we'll just check if we can resolve DNS
    try {
      const dns = require('dns').promises;
      await dns.resolve('google.com');
      dependencies.push({
        name: 'DNS Resolution',
        status: 'healthy',
        message: 'DNS resolution working'
      });
    } catch (error) {
      dependencies.push({
        name: 'DNS Resolution',
        status: 'unhealthy',
        message: `DNS resolution failed: ${error.message}`
      });
    }

    const failedDeps = dependencies.filter(dep => dep.status === 'unhealthy');
    let status = failedDeps.length > 0 ? 'unhealthy' : 'healthy';
    let message = failedDeps.length > 0 
      ? `${failedDeps.length} external dependencies failed`
      : 'All external dependencies are healthy';

    return {
      status,
      message,
      dependencies,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get a quick health status (for load balancer health checks)
   */
  async getQuickStatus() {
    try {
      // Quick database ping
      await sequelize.query('SELECT 1');
      
      // Quick Redis ping if available
      if (redisClient && redisClient.isOpen) {
        await redisClient.ping();
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get readiness status (for Kubernetes readiness probes)
   */
  async getReadinessStatus() {
    try {
      // Check if application is ready to serve requests
      const dbCheck = await this.checkDatabase();
      const redisCheck = await this.checkRedis();

      const isReady = dbCheck.status !== 'unhealthy' && 
                     redisCheck.status !== 'unhealthy';

      return {
        status: isReady ? 'ready' : 'not_ready',
        checks: {
          database: dbCheck.status,
          redis: redisCheck.status
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'not_ready',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get liveness status (for Kubernetes liveness probes)
   */
  async getLivenessStatus() {
    // Simple check to verify the application is running
    return {
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new HealthCheckService();
