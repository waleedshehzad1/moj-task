const redis = require('redis');
const logger = require('../utils/logger');

// Redis client wrapper
// Provides safe, optional caching/session helpers. The app functions without
// Redis: failures are logged but do not crash the process.
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      };

      // Add password if provided
      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }

      // Add TLS configuration for production
      if (process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true') {
        redisConfig.tls = {
          rejectUnauthorized: false
        };
      }

      this.client = redis.createClient(redisConfig);

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

      await this.client.connect();
      
      // Test connection
      await this.client.ping();
      logger.info('Redis connection established successfully');

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Don't throw error - app should work without Redis
      return null;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        logger.info('Redis client disconnected gracefully');
      } catch (error) {
        logger.error('Error disconnecting Redis client:', error);
      }
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping GET operation');
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expiration = 3600) {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping SET operation');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, expiration, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping DEL operation');
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async flushAll() {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping FLUSHALL operation');
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHALL error:', error);
      return false;
    }
  }

  // Cache helper methods
  async cacheGet(key) {
    return await this.get(`cache:${key}`);
  }

  async cacheSet(key, value, expiration = 3600) {
    return await this.set(`cache:${key}`, value, expiration);
  }

  async cacheDel(key) {
    return await this.del(`cache:${key}`);
  }

  // Session helper methods
  async sessionGet(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async sessionSet(sessionId, sessionData, expiration = 86400) {
    return await this.set(`session:${sessionId}`, sessionData, expiration);
  }

  async sessionDel(sessionId) {
    return await this.del(`session:${sessionId}`);
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = {
  redisClient,
  connectRedis: () => redisClient.connect(),
  disconnectRedis: () => redisClient.disconnect(),
  client: redisClient.client
};
