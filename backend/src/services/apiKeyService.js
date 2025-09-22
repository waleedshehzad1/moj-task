const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ApiKey } = require('../models');
const logger = require('../utils/logger');

/**
 * API Key Management Service
 *
 * Generates and validates hashed API keys with prefixes, optional expiry,
 * and permission scoping. Integrates with audit logging for lifecycle events.
 */
class ApiKeyService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.encryptionKey = this.getEncryptionKey();
  }

  /**
   * Get or generate encryption key for API keys
   */
  getEncryptionKey() {
    const key = process.env.API_KEY_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
    }
    
    // Ensure key is 32 bytes for AES-256
    return crypto.scryptSync(key, 'salt', 32);
  }

  /**
   * Generate a new API key
   * @param {Object} options - API key options
   * @param {string} options.name - Human readable name
   * @param {Array} options.permissions - Array of permissions
   * @param {number} options.rateLimit - Rate limit per hour
   * @param {Date} options.expiresAt - Expiration date
   * @param {string} options.createdBy - User ID who created the key
   * @returns {Object} Generated API key details
   */
  async generateApiKey(options) {
    try {
      const {
        name,
        permissions = [],
        rateLimit = 1000,
        expiresAt = null,
        createdBy,
        metadata = {}
      } = options;

      // Generate random API key
      const rawKey = crypto.randomBytes(32).toString('hex');
      const prefix = this.generatePrefix();
      const fullKey = `${prefix}_${rawKey}`;

      // Hash the key for storage
      const keyHash = await bcrypt.hash(fullKey, 12);

      // Create API key record
      const apiKey = await ApiKey.create({
        name,
        key_hash: keyHash,
        key_prefix: prefix,
        permissions,
        rate_limit: rateLimit,
        expires_at: expiresAt,
        created_by: createdBy,
        metadata: {
          ...metadata,
          created_from_ip: options.ipAddress,
          user_agent: options.userAgent
        }
      });

      // Log API key creation
      logger.logAudit('API_KEY_CREATED', {
        apiKeyId: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        createdBy: createdBy,
        rateLimit: apiKey.rate_limit,
        expiresAt: apiKey.expires_at
      });

      return {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey, // Only returned once during creation
        prefix: prefix,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rate_limit,
        expiresAt: apiKey.expires_at,
        isActive: apiKey.is_active,
        createdAt: apiKey.created_at
      };

    } catch (error) {
      logger.error('Failed to generate API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Validate an API key
   * @param {string} key - The API key to validate
   * @returns {Object|null} API key details if valid, null otherwise
   */
  async validateApiKey(key) {
    try {
      if (!key || typeof key !== 'string') {
        return null;
      }

      // Extract prefix from key
      const parts = key.split('_');
      if (parts.length !== 2) {
        return null;
      }

      const prefix = parts[0];

      // Find API key by prefix
      const apiKey = await ApiKey.findOne({
        where: {
          key_prefix: prefix,
          is_active: true
        }
      });

      if (!apiKey) {
        logger.logSecurityEvent('Invalid API Key Prefix', {
          prefix: prefix,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Check if key is expired
      if (apiKey.expires_at && new Date() > apiKey.expires_at) {
        logger.logSecurityEvent('Expired API Key Used', {
          apiKeyId: apiKey.id,
          name: apiKey.name,
          expiresAt: apiKey.expires_at,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Verify the key hash
      const isValid = await bcrypt.compare(key, apiKey.key_hash);
      if (!isValid) {
        logger.logSecurityEvent('Invalid API Key Hash', {
          apiKeyId: apiKey.id,
          prefix: prefix,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Update last used timestamp and usage count
      await apiKey.update({
        last_used_at: new Date(),
        usage_count: apiKey.usage_count + 1
      });

      return {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rate_limit,
        usageCount: apiKey.usage_count,
        lastUsedAt: apiKey.last_used_at
      };

    } catch (error) {
      logger.error('API key validation error:', error);
      return null;
    }
  }

  /**
   * Revoke an API key
   * @param {string} keyId - API key ID to revoke
   * @param {string} revokedBy - User ID who revoked the key
   * @returns {boolean} Success status
   */
  async revokeApiKey(keyId, revokedBy) {
    try {
      const apiKey = await ApiKey.findByPk(keyId);
      if (!apiKey) {
        return false;
      }

      await apiKey.update({
        is_active: false,
        metadata: {
          ...apiKey.metadata,
          revoked_at: new Date().toISOString(),
          revoked_by: revokedBy
        }
      });

      logger.logAudit('API_KEY_REVOKED', {
        apiKeyId: keyId,
        name: apiKey.name,
        revokedBy: revokedBy,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      logger.error('Failed to revoke API key:', error);
      return false;
    }
  }

  /**
   * List all API keys for a user
   * @param {string} userId - User ID
   * @returns {Array} List of API keys (without actual keys)
   */
  async listApiKeys(userId = null) {
    try {
      const whereClause = userId ? { created_by: userId } : {};
      
      const apiKeys = await ApiKey.findAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'key_prefix', 'permissions', 'rate_limit',
          'is_active', 'expires_at', 'last_used_at', 'usage_count',
          'created_at', 'updated_at'
        ],
        order: [['created_at', 'DESC']]
      });

      return apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        prefix: key.key_prefix,
        permissions: key.permissions,
        rateLimit: key.rate_limit,
        isActive: key.is_active,
        expiresAt: key.expires_at,
        lastUsedAt: key.last_used_at,
        usageCount: key.usage_count,
        createdAt: key.created_at,
        updatedAt: key.updated_at
      }));
    } catch (error) {
      logger.error('Failed to list API keys:', error);
      throw new Error('Failed to list API keys');
    }
  }

  /**
   * Check if API key has specific permission
   * @param {Object} apiKey - API key object from validation
   * @param {string} permission - Permission to check
   * @returns {boolean} Whether the API key has the permission
   */
  hasPermission(apiKey, permission) {
    if (!apiKey || !apiKey.permissions) {
      return false;
    }

    // Check for wildcard permission
    if (apiKey.permissions.includes('*')) {
      return true;
    }

    // Check for exact permission match
    if (apiKey.permissions.includes(permission)) {
      return true;
    }

    // Check for wildcard in resource (e.g., 'tasks:*' matches 'tasks:read')
    const [resource, action] = permission.split(':');
    const wildcardPermission = `${resource}:*`;
    
    return apiKey.permissions.includes(wildcardPermission);
  }

  /**
   * Generate a random prefix for API keys
   * @returns {string} Random prefix
   */
  generatePrefix() {
    const prefixes = ['hmcts', 'api', 'svc', 'app', 'dev', 'prod'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = crypto.randomBytes(2).toString('hex');
    return `${randomPrefix}_${randomSuffix}`;
  }

  /**
   * Cleanup expired API keys
   * @returns {number} Number of cleaned up keys
   */
  async cleanupExpiredKeys() {
    try {
      const expiredKeys = await ApiKey.findAll({
        where: {
          expires_at: {
            [Op.lt]: new Date()
          },
          is_active: true
        }
      });

      let cleanedCount = 0;
      for (const key of expiredKeys) {
        await key.update({
          is_active: false,
          metadata: {
            ...key.metadata,
            auto_expired_at: new Date().toISOString()
          }
        });
        cleanedCount++;
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired API keys`);
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired API keys:', error);
      return 0;
    }
  }

  /**
   * Get API key usage statistics
   * @param {string} keyId - API key ID
   * @returns {Object} Usage statistics
   */
  async getApiKeyStats(keyId) {
    try {
      const apiKey = await ApiKey.findByPk(keyId);
      if (!apiKey) {
        return null;
      }

      // Calculate days since creation
      const daysSinceCreation = Math.floor(
        (new Date() - apiKey.created_at) / (1000 * 60 * 60 * 24)
      );

      // Calculate average daily usage
      const avgDailyUsage = daysSinceCreation > 0 
        ? Math.round(apiKey.usage_count / daysSinceCreation)
        : apiKey.usage_count;

      return {
        id: apiKey.id,
        name: apiKey.name,
        totalUsage: apiKey.usage_count,
        daysSinceCreation,
        avgDailyUsage,
        lastUsedAt: apiKey.last_used_at,
        isActive: apiKey.is_active,
        expiresAt: apiKey.expires_at,
        rateLimit: apiKey.rate_limit
      };
    } catch (error) {
      logger.error('Failed to get API key stats:', error);
      return null;
    }
  }
}

module.exports = new ApiKeyService();
